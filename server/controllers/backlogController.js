import Backlog from "../models/Backlog.js";

const escapeRegex = (text = "") => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const addToBacklog = async (req, res) => {
  try {
    const { gameTitle, status, coverUrl } = req.body;
    const normalizedTitle = (gameTitle || "").trim();

    if (!normalizedTitle) {
      return res.status(400).json({ message: "Game title is required" });
    }

    const existingEntry = await Backlog.findOne({
      user: req.user._id,
      gameTitle: { $regex: new RegExp(`^${escapeRegex(normalizedTitle)}$`, "i") },
    });

    if (existingEntry) {
      return res.status(409).json({ message: "Game already in backlog" });
    }

    const entry = await Backlog.create({
      user: req.user._id,
      gameTitle: normalizedTitle,
      status,
      coverUrl,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBacklog = async (req, res) => {
  try {
    const entries = await Backlog.find({ user: req.user._id });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBacklog = async (req, res) => {
  try {
    const entry = await Backlog.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    entry.status = req.body.status || entry.status;

    const updated = await entry.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBacklog = async (req, res) => {
  try {
    const entry = await Backlog.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await entry.deleteOne();
    res.json({ message: "Entry removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};