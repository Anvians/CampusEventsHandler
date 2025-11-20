import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    caption: { type: String, trim: true, maxlength: 500 },
    image_url: { type: String, required: true },
    image_public_id: { type: String },
    visibility: {
      type: String,
      enum: ["PUBLIC", "DEPARTMENT", "EVENT", "CLUB_MEMBERS"],
      default: "PUBLIC",
    },
    user_id: { type: Number, required: true }, 
    event_id: { type: Number }, 
    likes_count: { type: Number, default: 0 },
    comments_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

postSchema.index({ user_id: 1 });
postSchema.index({ created_at: -1 });

export default mongoose.model("Post", postSchema);
