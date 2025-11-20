import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "NEW_LIKE",
        "NEW_COMMENT",
        "NEW_FOLLOWER",
        "EVENT_ANNOUNCEMENT",
        "REGISTRATION_CONFIRMED",
        "NEW_RESULT",
        "EVENT_REMINDER",
        "CLUB_ANNOUNCEMENT",
      ],
      required: true,
    },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, required: true },
    is_read: { type: Boolean, default: false },

    receiver_id: { type: Number, required: true }, 
    originator_id: { type: Number }, 
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

notificationSchema.index({ receiver_id: 1, created_at: -1 });
notificationSchema.index({ originator_id: 1 });
notificationSchema.index({ is_read: 1 });

export default mongoose.model("Notification", notificationSchema);
