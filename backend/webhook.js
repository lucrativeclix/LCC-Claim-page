import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Faucet config
const FAUCET_CONTRACT_ADDRESS = process.env.FAUCET_CONTRACT_ADDRESS;
const LCC_TOKEN_ADDRESS = process.env.LCC_TOKEN_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT || "100";

// Web3 setup
const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const faucetABI = ["function claim(address _to, uint256 _amount) external"];
const faucetContract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, faucetABI, wallet);

// Webhook route
app.post("/webhook", async (req, res) => {
  const signature = req.headers["reown-signature"];
  const payload = JSON.stringify(req.body);

  // Verify signature
  const expected = crypto
    .createHmac("sha256", process.env.REOWN_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expected) {
    console.log("⚠️ Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  try {
    const userAddress = req.body.wallet; // Make sure Reown sends wallet in payload
    if (!userAddress) return res.status(400).send("Wallet not provided");

    const tx = await faucetContract.claim(userAddress, ethers.parseUnits(FAUCET_AMOUNT, 18));
    await tx.wait();

    console.log(`✅ Sent ${FAUCET_AMOUNT} LCC to ${userAddress}`);
    res.status(200).send("Faucet claim successful");
  } catch (err) {
    console.error("Faucet claim failed:", err);
    res.status(500).send("Faucet error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`💫 Faucet backend running on port ${PORT}`));
