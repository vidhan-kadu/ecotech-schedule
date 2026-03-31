import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Availability from "../models/Availability.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/*
 Generate JWT token for a user
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/*
 Register a new user
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }],
    });
    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "Email" : "Username";
      return res.status(400).json({ message: `${field} is already taken` });
    }

    const user = await User.create({
      name,
      email,
      password,
      username: username.toLowerCase(),
    });

    // Create default availability (Mon-Fri, 9AM-5PM)
    const defaultDays = [1, 2, 3, 4, 5];
    await Promise.all(
      defaultDays.map((day) =>
        Availability.create({
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isEnabled: true,
          user: user._id,
        }),
      ),
    );

    // Also create disabled entries for weekends
    await Promise.all(
      [0, 6].map((day) =>
        Availability.create({
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isEnabled: false,
          user: user._id,
        }),
      ),
    );

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/**
 Login with email and password
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

/**
 Get current authenticated user
 */
router.get("/me", auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 Update user profile
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, username, timezone } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (timezone) updates.timezone = timezone;

    if (username && username.toLowerCase() !== req.user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      updates.username = username.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      returnDocument: "after",
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error updating profile" });
  }
});

export default router;
