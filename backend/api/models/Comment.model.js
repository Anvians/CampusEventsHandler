import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user_id: { type: Number, required: true }, // PostgreSQL User.id
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

commentSchema.index({ post_id: 1 });
commentSchema.index({ user_id: 1 });
commentSchema.index({ created_at: -1 }); 

export default mongoose.model("Comment", commentSchema);
