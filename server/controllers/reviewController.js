import Review from "../models/Review.js";

const escapeRegex = (text = "") => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createReview = async (req, res) => {
  try {
    const { gameTitle, rating, comment, coverUrl } = req.body;
    const normalizedTitle = gameTitle?.trim();

    if (!normalizedTitle) {
      return res.status(400).json({ message: "Game title is required" });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      gameTitle: { $regex: new RegExp(`^${escapeRegex(normalizedTitle)}$`, "i") },
    });

    if (existingReview) {
      return res.status(409).json({ message: "You already reviewed that game." });
    }

    const review = await Review.create({
      user: req.user._id,
      gameTitle: normalizedTitle,
      rating,
      comment,
      coverUrl: coverUrl || null,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { gameTitle, rating, comment, coverUrl } = req.body;

    if (gameTitle !== undefined) {
      const normalizedTitle = gameTitle.trim();

      if (!normalizedTitle) {
        return res.status(400).json({ message: "Game title is required" });
      }

      const existingReview = await Review.findOne({
        user: req.user._id,
        _id: { $ne: review._id },
        gameTitle: { $regex: new RegExp(`^${escapeRegex(normalizedTitle)}$`, "i") },
      });

      if (existingReview) {
        return res.status(409).json({ message: "You already reviewed that game." });
      }

      review.gameTitle = normalizedTitle;
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (coverUrl !== undefined) review.coverUrl = coverUrl;

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};