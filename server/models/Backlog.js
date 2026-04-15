import mongoose from "mongoose";

const backlogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gameTitle: {
    type: String,
    required: true,
  },
  coverUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["wishlist", "playing", "completed"],
    default: "wishlist",
  },
}, { timestamps: true });

export default mongoose.model("Backlog", backlogSchema);