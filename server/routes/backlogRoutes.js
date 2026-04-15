import express from "express";
import {
  addToBacklog,
  getBacklog,
  updateBacklog,
  deleteBacklog,
} from "../controllers/backlogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addToBacklog);
router.get("/", protect, getBacklog);
router.put("/:id", protect, updateBacklog);
router.delete("/:id", protect, deleteBacklog);

export default router;