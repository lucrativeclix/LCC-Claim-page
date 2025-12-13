"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export default function WalletConnect() {
  const { connect } = useConnect({ connector: new InjectedConnector() });
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const [error, setError] = useState("");

  return (
    <div className="mb-4">
      {!isConnected ? (
        <button
          onClick={() => connect()}
          className="px-6 py-3 bg-primaryPurple rounded-lg font-bold hover:opacity-80 transition"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col items-center">
          <p className="mb-2">Connected: {address}</p>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-600 rounded-lg hover:opacity-80 transition"
          >
            Disconnect
          </button>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
