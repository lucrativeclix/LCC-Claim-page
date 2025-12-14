import express from "express";
import User from "../models/User.js";
import axios from "axios";
import { ethers } from "ethers";
import crypto from "crypto";

const router = express.Router();

// Load env variables
const FAUCET_ADDRESS = process.env.FAUCET_CONTRACT_ADDRESS;
const LCC_TOKEN_ADDRESS = process.env.LCC_TOKEN_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

// Ethers setup
const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const faucetContract = new ethers.Contract(FAUCET_ADDRESS, ["function claim() external"], wallet);

router.post("/", async (req, res) => {
  const { address, captcha } = req.body;

  if (!address || !captcha) return res.status(400).json({ error: "Missing address or captcha" });

  // Verify reCAPTCHA
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${captcha}`;
  try {
    const response = await axios.post(verifyURL);
    if (!response.data.success) return res.status(400).json({ error: "Captcha failed" });
  } catch {
    return res.status(500).json({ error: "Captcha verification failed" });
  }

  try {
    let user = await User.findOne({ wallet: address.toLowerCase() });
    const now = new Date();

    if (user && user.lastClaim) {
      const diff = (now - user.lastClaim) / 1000; // seconds
      if (diff < 12 * 60 * 60) {
        const remaining = 12 * 60 * 60 - diff;
        return res.status(400).json({ error: "Cooldown active", remaining });
      }
    }

    // Send LCC via faucet contract
    const tx = await faucetContract.claim({ from: address });
    await tx.wait();

    // SHA-256 logging
    const sha = crypto.createHash("sha256").update(address + now.toISOString()).digest("hex");

    if (!user) {
      user = new User({ wallet: address.toLowerCase(), lastClaim: now, shaHash: sha });
    } else {
      user.lastClaim = now;
      user.shaHash = sha;
    }

    await user.save();

    res.json({ success: true, shaHash: sha, txHash: tx.hash });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Claim failed" });
  }
});

export default router;
