import express from "express";
import { searchGamesIGDB } from "../services/igdbService.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const games = await searchGamesIGDB(query);
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "IGDB error" });
  }
});

export default router;