import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import backlogRoutes from "./routes/backlogRoutes.js";
import igdbRoutes from "./routes/igdbRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";


const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/backlog", backlogRoutes);
app.use("/api/igdb", igdbRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });