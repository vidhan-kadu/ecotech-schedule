import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";

// Route imports
import authRoutes from "./routes/auth.js";
import eventTypeRoutes from "./routes/eventTypes.js";
import availabilityRoutes from "./routes/availability.js";
import bookingRoutes from "./routes/bookings.js";
import calendarRoutes from "./routes/calendar.js";
import llmRoutes from "./routes/llm.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL, 
      "http://localhost:5173", 
      "https://ecotech-schedule.vercel.app"
    ].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/llm", llmRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
