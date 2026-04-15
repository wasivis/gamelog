import express from "express";
import User from "../models/User.js";
import Backlog from "../models/Backlog.js";
import Review from "../models/Review.js";

const router = express.Router();

// GET public profile
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const backlog = await Backlog.find({ user: user._id });
    const reviews = await Review.find({ user: user._id });

    res.json({
      username: user.username,
      backlog,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;