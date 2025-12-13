"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import axios from "axios";

export default function ClaimCard() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState("");
  const [error, setError] = useState("");

  const handleClaim = async () => {
    if (!address) { setError("Connect wallet first"); return; }
    setLoading(true); setError("");
    try {
      const response = await axios.post("/api/claim", { claimer: address });
      if (response.data.ok) setTx(response.data.tx);
      else setError(response.data.error || "Claim failed");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 bg-[#1a1a1a] rounded-xl shadow-lg flex flex-col items-center">
      <p className="mb-4">Claim 0.001 LCC</p>
      <button
        onClick={handleClaim}
        disabled={loading}
        className="px-6 py-3 bg-primaryPurple rounded-lg hover:opacity-80 transition mb-2"
      >
        {loading ? "Claiming..." : "Claim"}
      </button>
      {tx && <p className="text-green-400">Tx: {tx}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
