import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  deleteMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.delete("/me", protect, deleteMe);

export default router;