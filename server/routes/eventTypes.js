import express from "express";
import EventType from "../models/EventType.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * Generate a URL-friendly slug from a title
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**

 * Get all event types for the authenticated user
 */
router.get("/", auth, async (req, res) => {
  try {
    const eventTypes = await EventType.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ eventTypes });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching event types" });
  }
});

/**

 * Create a new event type
 */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, duration, location, color } = req.body;

    if (!title || !duration) {
      return res
        .status(400)
        .json({ message: "Title and duration are required" });
    }

    let slug = generateSlug(title);

    // Ensure unique slug for this user
    const existing = await EventType.findOne({ user: req.userId, slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const eventType = await EventType.create({
      title,
      slug,
      description: description || "",
      duration: parseInt(duration),
      location: location || "Google Meet",
      color: color || "#6366f1",
      user: req.userId,
    });

    res.status(201).json({ eventType });
  } catch (error) {
    console.error("Create event type error:", error);
    res.status(500).json({ message: "Server error creating event type" });
  }
});

/**

 * Update an event type
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const eventType = await EventType.findOne({
      _id: req.params.id,
      user: req.userId,
    });
    if (!eventType) {
      return res.status(404).json({ message: "Event type not found" });
    }

    const { title, description, duration, location, color, isActive } =
      req.body;
    if (title) {
      eventType.title = title;
      eventType.slug = generateSlug(title);
    }
    if (description !== undefined) eventType.description = description;
    if (duration) eventType.duration = parseInt(duration);
    if (location) eventType.location = location;
    if (color) eventType.color = color;
    if (isActive !== undefined) eventType.isActive = isActive;

    await eventType.save();
    res.json({ eventType });
  } catch (error) {
    res.status(500).json({ message: "Server error updating event type" });
  }
});

/**

 * Delete an event type
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const eventType = await EventType.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });
    if (!eventType) {
      return res.status(404).json({ message: "Event type not found" });
    }
    res.json({ message: "Event type deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting event type" });
  }
});

/**

 * Get active event types for a public user profile
 */
router.get("/public/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username.toLowerCase(),
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const eventTypes = await EventType.find({ user: user._id, isActive: true });
    res.json({
      user: { name: user.name, username: user.username, image: user.image },
      eventTypes,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
