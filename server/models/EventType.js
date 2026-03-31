import mongoose from "mongoose";

const eventTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 5,
      max: 480,
    },
    location: {
      type: String,
      default: "Google Meet",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

eventTypeSchema.index({ user: 1, slug: 1 }, { unique: true });

const EventType = mongoose.model("EventType", eventTypeSchema);
export default EventType;
