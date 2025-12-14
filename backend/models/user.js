import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  lastClaim: { type: Date, default: new Date(0) } // default epoch
});

export default mongoose.model("User", userSchema);
