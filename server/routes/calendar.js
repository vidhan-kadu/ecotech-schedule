import express from "express";
import { google } from "googleapis";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * Create OAuth2 client for Google Calendar integration
 */
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
};

/**

 * Generate Google OAuth2 authorization URL
 */
router.get("/auth-url", auth, async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res
        .status(400)
        .json({ message: "Google Calendar credentials not configured" });
    }

    const oauth2Client = getOAuth2Client();
    const scopes = ["https://www.googleapis.com/auth/calendar"];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
      state: req.userId.toString(), // Pass user ID in state for callback
    });

    res.json({ url });
  } catch (error) {
    console.error("Auth URL error:", error);
    res.status(500).json({ message: "Error generating auth URL" });
  }
});

/**

 * Handle OAuth2 callback from Google
 */
router.get("/callback", async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.redirect(
        `${process.env.CLIENT_URL}/dashboard/settings?calendar=error`,
      );
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in user document
    await User.findByIdAndUpdate(userId, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token || "",
    });

    res.redirect(
      `${process.env.CLIENT_URL}/dashboard/settings?calendar=connected`,
    );
  } catch (error) {
    console.error("Calendar callback error:", error);
    res.redirect(`${process.env.CLIENT_URL}/dashboard/settings?calendar=error`);
  }
});

/**

 * Check if Google Calendar is connected
 */
router.get("/status", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("googleAccessToken");
    res.json({ connected: !!user.googleAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**

 * Sync a booking to Google Calendar
 */
router.post("/sync/:bookingId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.googleAccessToken) {
      return res.status(400).json({ message: "Google Calendar not connected" });
    }

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      host: req.userId,
    }).populate("eventType", "title description location");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Set up Google Calendar client
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Create calendar event
    const event = {
      summary: `${booking.eventType.title} with ${booking.guestName}`,
      description: `Booked via EcoTech Scheduler\n\nGuest: ${booking.guestName} (${booking.guestEmail})\n${booking.guestNotes ? `Notes: ${booking.guestNotes}` : ""}`,
      location: booking.eventType.location,
      start: {
        dateTime: booking.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: booking.endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: [{ email: booking.guestEmail }],
    };

    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    // Save Google event ID back to booking
    booking.googleEventId = createdEvent.data.id;
    await booking.save();

    res.json({
      message: "Event synced to Google Calendar",
      eventId: createdEvent.data.id,
    });
  } catch (error) {
    console.error("Calendar sync error:", error);
    res.status(500).json({ message: "Error syncing to Google Calendar" });
  }
});

/**

 * Disconnect Google Calendar
 */
router.delete("/disconnect", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      googleAccessToken: "",
      googleRefreshToken: "",
    });
    res.json({ message: "Google Calendar disconnected" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
