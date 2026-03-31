import express from "express";
import Booking from "../models/Booking.js";
import EventType from "../models/EventType.js";
import Availability from "../models/Availability.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import {
  addMinutes,
  startOfDay,
  endOfDay,
  parseISO,
  format,
  isAfter,
  isBefore,
  areIntervalsOverlapping,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const router = express.Router();

/**
  GET /api/bookings
 Get all bookings for the authenticated user (as host)
 */
router.get("/", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.userId })
      .populate("eventType", "title duration color")
      .sort({ startTime: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching bookings" });
  }
});

/**
 
 Get available time slots for a specific date
 Query: ?date=2025-03-15&timezone=America/New_York
 */
router.get("/slots/:username/:eventSlug", async (req, res) => {
  try {
    const { username, eventSlug } = req.params;
    const { date, timezone = "UTC" } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Find the host user
    const host = await User.findOne({ username: username.toLowerCase() });
    if (!host) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the event type
    const eventType = await EventType.findOne({
      user: host._id,
      slug: eventSlug,
      isActive: true,
    });
    if (!eventType) {
      return res.status(404).json({ message: "Event type not found" });
    }

    // Parse the requested date (this is in the guest's timezone perspective)
    const requestedDate = parseISO(date);
    const dayOfWeek = requestedDate.getDay();

    // Get host's availability for this day of week
    const availability = await Availability.findOne({
      user: host._id,
      dayOfWeek,
      isEnabled: true,
    });

    if (!availability) {
      return res.json({ slots: [], eventType });
    }

    // Convert host's availability times to UTC based on host's timezone
    const hostTimezone = host.timezone || "UTC";
    const [startH, startM] = availability.startTime.split(":").map(Number);
    const [endH, endM] = availability.endTime.split(":").map(Number);

    const dayStart = new Date(requestedDate);
    dayStart.setHours(startH, startM, 0, 0);
    const availStart = fromZonedTime(dayStart, hostTimezone);

    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(endH, endM, 0, 0);
    const availEnd = fromZonedTime(dayEnd, hostTimezone);

    const existingBookings = await Booking.find({
      host: host._id,
      status: { $ne: "CANCELLED" },
      startTime: { $gte: availStart },
      endTime: { $lte: availEnd },
    });

    const slots = [];
    let slotStart = new Date(availStart);
    const duration = eventType.duration;

    while (addMinutes(slotStart, duration) <= availEnd) {
      const slotEnd = addMinutes(slotStart, duration);

      const hasConflict = existingBookings.some((booking) =>
        areIntervalsOverlapping(
          { start: slotStart, end: slotEnd },
          {
            start: new Date(booking.startTime),
            end: new Date(booking.endTime),
          },
        ),
      );

      const now = new Date();
      if (!hasConflict && isAfter(slotStart, now)) {
        // Convert to guest timezone for display
        const guestStart = toZonedTime(slotStart, timezone);
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          displayTime: format(guestStart, "HH:mm"),
        });
      }

      slotStart = addMinutes(slotStart, duration);
    }

    res.json({ slots, eventType });
  } catch (error) {
    console.error("Get slots error:", error);
    res.status(500).json({ message: "Server error fetching slots" });
  }
});

/**
 Create a new booking (public — no auth required)
 */
router.post("/", async (req, res) => {
  try {
    const {
      eventTypeId,
      startTime,
      endTime,
      guestName,
      guestEmail,
      guestNotes,
      guestTimezone,
    } = req.body;

    if (!eventTypeId || !startTime || !endTime || !guestName || !guestEmail) {
      return res
        .status(400)
        .json({ message: "Missing required booking fields" });
    }

    const eventType = await EventType.findById(eventTypeId).populate("user");
    if (!eventType) {
      return res.status(404).json({ message: "Event type not found" });
    }

    // Check for overlapping bookings
    const conflict = await Booking.findOne({
      host: eventType.user._id,
      status: { $ne: "CANCELLED" },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
    });

    if (conflict) {
      return res
        .status(409)
        .json({ message: "This time slot is no longer available" });
    }

    const booking = await Booking.create({
      eventType: eventTypeId,
      host: eventType.user._id,
      guestName,
      guestEmail,
      guestNotes: guestNotes || "",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      guestTimezone: guestTimezone || "UTC",
      status: "CONFIRMED",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("eventType", "title duration")
      .populate("host", "name email");

    res.status(201).json({ booking: populatedBooking });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error creating booking" });
  }
});

/**
  Update booking status (confirm / cancel)
 */
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, host: req.userId },
      { status },
      { returnDocument: "after" },
    ).populate("eventType", "title duration");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: "Server error updating booking" });
  }
});

export default router;
