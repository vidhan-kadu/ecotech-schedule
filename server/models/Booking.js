import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    eventType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventType",
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guestName: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, "Guest email is required"],
      lowercase: true,
      trim: true,
    },
    guestNotes: {
      type: String,
      default: "",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    guestTimezone: {
      type: String,
      default: "UTC",
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
    googleEventId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries on upcoming bookings
bookingSchema.index({ host: 1, startTime: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
