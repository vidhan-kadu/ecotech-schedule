import express from "express";
import Availability from "../models/Availability.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
  Get availability for the authenticated user
 */
router.get("/", auth, async (req, res) => {
  try {
    const availability = await Availability.find({ user: req.userId }).sort({
      dayOfWeek: 1,
    });
    res.json({ availability });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching availability" });
  }
});

/**
 Bulk update availability for all 7 days
 Expects: { availability: [{ dayOfWeek, startTime, endTime, isEnabled }] }
 */
router.put("/", auth, async (req, res) => {
  try {
    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res
        .status(400)
        .json({ message: "Availability array is required" });
    }

    // Upsert each day's availability
    const updates = await Promise.all(
      availability.map(async (slot) => {
        return Availability.findOneAndUpdate(
          { user: req.userId, dayOfWeek: slot.dayOfWeek },
          {
            startTime: slot.startTime,
            endTime: slot.endTime,
            isEnabled: slot.isEnabled,
            user: req.userId,
          },
          { upsert: true, returnDocument: "after" },
        );
      }),
    );

    res.json({
      availability: updates.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    });
  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({ message: "Server error updating availability" });
  }
});

export default router;
