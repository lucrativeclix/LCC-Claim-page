import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import claimRoute from "./routes/claim.js";

dotenv.config();
const app = express();
app.use(cors({ origin: "*" })); // change * to your frontend URL in production
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/claim", claimRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
