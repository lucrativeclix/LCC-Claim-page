"use client";

import WalletConnect from "@/components/WalletConnect";
import ClaimCard from "@/components/ClaimCard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-darkBackground relative overflow-hidden">
      <h1 className="text-4xl font-bold text-primaryPurple mb-6 z-10 relative">
        LucrativeClix Coin (LCC) Claim
      </h1>
      <WalletConnect />
      <ClaimCard />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <span className="text-primaryPurple opacity-20 text-[200px] absolute animate-float" style={{top: "10%", left: "20%"}}>LCC</span>
        <span className="text-primaryPurple opacity-15 text-[300px] absolute animate-float" style={{top: "50%", left: "60%"}}>LCC</span>
      </div>
    </main>
  );
}
