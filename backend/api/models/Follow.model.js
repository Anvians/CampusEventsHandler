import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower_id: {
      type: Number,
      required: true, 
    },
    following_id: {
      type: Number,
      required: true,
      validate: {
        validator: function () {
          return this.follower_id !== this.following_id;
        },
        message: "User cannot follow themselves.",
      },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

// Prevent duplicate follows
followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });

// Helpful indexes for lookup queries
followSchema.index({ follower_id: 1 });
followSchema.index({ following_id: 1 });

export default mongoose.model("Follow", followSchema);
