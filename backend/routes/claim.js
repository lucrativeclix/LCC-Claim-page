import express from "express";
import User from "../models/User.js";
import fetch from "node-fetch";
import { ethers } from "ethers";
import crypto from "crypto";

const router = express.Router();

// ERC20 ABI to get balance
const ERC20_ABI = [
  "function balanceOf(address) view returns(uint256)",
  "function decimals() view returns(uint8)"
];

// Hash addresses for secure logging
function hashAddress(address){
  return crypto.createHash('sha256').update(address).digest('hex');
}

// Claim endpoint
router.post("/", async (req, res) => {
  const { address, captcha } = req.body;
  if(!address || !captcha) return res.status(400).json({ error: "Missing parameters" });

  console.log("Claim attempt by:", hashAddress(address));

  // Verify reCAPTCHA
  try {
    const captchaVerify = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`, { method: 'POST' });
    const captchaData = await captchaVerify.json();
    if(!captchaData.success) return res.status(400).json({ error: "Captcha failed" });
  } catch(err) {
    return res.status(500).json({ error: "Captcha verification failed" });
  }

  const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const faucetContract = new ethers.Contract(process.env.FAUCET_CONTRACT_ADDRESS, ["function claim(address) external"], wallet);
  const tokenContract = new ethers.Contract(process.env.LCC_TOKEN_ADDRESS, ERC20_ABI, provider);

  try {
    // Cooldown check
    let user = await User.findOne({ address });
    const now = new Date();
    if(user && (now - user.lastClaim)/1000 < 12*60*60){
      const remaining = 12*60*60 - Math.floor((now - user.lastClaim)/1000);
      return res.status(400).json({ error: "Cooldown active", remaining });
    }

    // Send faucet claim transaction
    const tx = await faucetContract.claim(address);
    await tx.wait();

    if(!user) user = new User({ address, lastClaim: now });
    else user.lastClaim = now;
    await user.save();

    // Fetch real LCC balance
    const rawBalance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    const balance = Number(rawBalance)/10**decimals;

    res.json({ success: true, balance });

  } catch(err){
    console.error(err);
    res.status(500).json({ error: "Blockchain transaction failed" });
  }
});

export default router;
