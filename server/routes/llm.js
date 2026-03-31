import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Availability from "../models/Availability.js";
import User from "../models/User.js";
import EventType from "../models/EventType.js";
import Booking from "../models/Booking.js";
import {
  addMinutes,
  parseISO,
  format,
  startOfDay,
  addDays,
  areIntervalsOverlapping,
  isAfter,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const router = express.Router();

/**
 * Use Gemini LLM to parse natural language scheduling requests
 * and suggest available time slots
 *
 * Body: { query, username, eventSlug, timezone }
 * Example query: "Find me a slot next Wednesday afternoon"
 */
router.post("/suggest-slots", async (req, res) => {
  try {
    const { query, username, eventSlug, timezone = "UTC" } = req.body;

    if (!query || !username || !eventSlug) {
      return res
        .status(400)
        .json({ message: "Query, username, and eventSlug are required" });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        message: "AI features are not configured. Please set GEMINI_API_KEY.",
        fallback: true,
      });
    }

    // Find user and event type
    const host = await User.findOne({ username: username.toLowerCase() });
    if (!host) return res.status(404).json({ message: "User not found" });

    const eventType = await EventType.findOne({
      user: host._id,
      slug: eventSlug,
      isActive: true,
    });
    if (!eventType)
      return res.status(404).json({ message: "Event type not found" });

    // Get host's availability
    const availability = await Availability.find({
      user: host._id,
      isEnabled: true,
    });
    const availMap = {};
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    availability.forEach((a) => {
      availMap[dayNames[a.dayOfWeek]] = `${a.startTime} - ${a.endTime}`;
    });

    // Use Gemini to understand the user's request
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const today = new Date();
    const prompt = `You are a scheduling assistant. Today's date is ${format(today, "yyyy-MM-dd")} (${dayNames[today.getDay()]}).
The user's timezone is ${timezone}. The meeting duration is ${eventType.duration} minutes.

The host is available on these days and times (in host's local time, timezone: ${host.timezone || "UTC"}):
${Object.entries(availMap)
  .map(([day, time]) => `- ${day}: ${time}`)
  .join("\n")}

The user said: "${query}"

Based on this, respond ONLY with a JSON object (no markdown, no explanation) in this format:
{
  "dates": ["YYYY-MM-DD", "YYYY-MM-DD"],
  "preferredTimeRange": "morning|afternoon|evening|any",
  "interpretation": "Brief one-line interpretation of what the user wants"
}

Return up to 3 suggested dates that match the user's request and fall on days the host is available. Only suggest dates in the future.`;

    let parsed;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const jsonStr = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(jsonStr);
    } catch (apiError) {
      console.warn(
        "Gemini API failed or quota exceeded. Falling back to basic matching...",
      );

      const lowerQuery = query.toLowerCase();
      let timeRange = "any";
      if (lowerQuery.includes("morning")) timeRange = "morning";
      else if (lowerQuery.includes("afternoon") || lowerQuery.includes("noon"))
        timeRange = "afternoon";
      else if (lowerQuery.includes("evening") || lowerQuery.includes("night"))
        timeRange = "evening";

      parsed = {
        dates: [
          format(addDays(today, 1), "yyyy-MM-dd"),
          format(addDays(today, 2), "yyyy-MM-dd"),
          format(addDays(today, 3), "yyyy-MM-dd"),
        ],
        preferredTimeRange: timeRange,
        interpretation: "Smart Match (Fallback Mode)",
      };
    }

    // Now fetch actual available slots for the suggested dates
    const suggestedSlots = [];

    for (const dateStr of parsed.dates || []) {
      const requestedDate = parseISO(dateStr);
      const dayOfWeek = requestedDate.getDay();

      const dayAvail = await Availability.findOne({
        user: host._id,
        dayOfWeek,
        isEnabled: true,
      });

      if (!dayAvail) continue;

      const hostTimezone = host.timezone || "UTC";
      const [startH, startM] = dayAvail.startTime.split(":").map(Number);
      const [endH, endM] = dayAvail.endTime.split(":").map(Number);

      const dayStart = new Date(requestedDate);
      dayStart.setHours(startH, startM, 0, 0);
      const availStart = fromZonedTime(dayStart, hostTimezone);

      const dayEnd = new Date(requestedDate);
      dayEnd.setHours(endH, endM, 0, 0);
      const availEnd = fromZonedTime(dayEnd, hostTimezone);

      // Get existing bookings
      const existingBookings = await Booking.find({
        host: host._id,
        status: { $ne: "CANCELLED" },
        startTime: { $gte: availStart },
        endTime: { $lte: availEnd },
      });

      // Generate slots
      let slotStart = new Date(availStart);
      const now = new Date();

      while (addMinutes(slotStart, eventType.duration) <= availEnd) {
        const slotEnd = addMinutes(slotStart, eventType.duration);

        const hasConflict = existingBookings.some((booking) =>
          areIntervalsOverlapping(
            { start: slotStart, end: slotEnd },
            {
              start: new Date(booking.startTime),
              end: new Date(booking.endTime),
            },
          ),
        );

        if (!hasConflict && isAfter(slotStart, now)) {
          // Filter by preferred time range
          const guestTime = toZonedTime(slotStart, timezone);
          const hour = guestTime.getHours();
          let include = true;

          if (
            parsed.preferredTimeRange === "morning" &&
            (hour < 6 || hour >= 12)
          )
            include = false;
          if (
            parsed.preferredTimeRange === "afternoon" &&
            (hour < 12 || hour >= 17)
          )
            include = false;
          if (
            parsed.preferredTimeRange === "evening" &&
            (hour < 17 || hour >= 21)
          )
            include = false;

          if (include) {
            suggestedSlots.push({
              date: dateStr,
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
              displayTime: format(guestTime, "HH:mm"),
              displayDate: format(guestTime, "EEE, MMM d"),
            });
          }
        }

        slotStart = addMinutes(slotStart, eventType.duration);
      }
    }

    // Limit to top suggestions
    const topSlots = suggestedSlots.slice(0, 6);

    res.json({
      interpretation: parsed.interpretation,
      suggestions: topSlots,
      totalFound: suggestedSlots.length,
    });
  } catch (error) {
    console.error("LLM suggest error:", error);
    res.status(500).json({ message: "AI scheduling error", fallback: true });
  }
});

export default router;
