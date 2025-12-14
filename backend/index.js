import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import claimRoute from "./routes/claim.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60*1000, // 1 min
  max: 5,
  message: "Too many requests, try again later."
});
app.use("/claim", limiter);

// Routes
app.use("/claim", claimRoute);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>console.log("✅ MongoDB connected"))
.catch(err=>console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`🚀 LCC Faucet backend running on port ${PORT}`));
