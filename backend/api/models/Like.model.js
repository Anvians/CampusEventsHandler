import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user_id: { type: Number, required: true }, // PostgreSQL User.id
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

likeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

likeSchema.index({ post_id: 1 });
likeSchema.index({ user_id: 1 });

export default mongoose.model("Like", likeSchema);
