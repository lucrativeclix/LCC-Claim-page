import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  lastClaim: { type: Date, default: null },
  shaHash: { type: String } // SHA-256 of claim info
});

export default mongoose.model("User", userSchema);
