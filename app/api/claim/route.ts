import { NextResponse } from "next/server";
import { mintTo } from "@/lib/contract";
import { supabase } from "@/lib/db";

export async function POST(req: Request) {
  const { claimer, referral } = await req.json();
  const amount = Number(process.env.CAP_PER_WALLET || "0.001");

  try {
    const tx = await mintTo(claimer, amount);

    await supabase.from("claims").insert({
      claimer,
      referrer: referral || null,
      amount,
      tx_hash: tx.transactionHash
    });

    const affPercent = Number(process.env.AFFILIATE_SHARE || "49");
    if (referral) {
      const cut = amount * (affPercent / 100);
      await mintTo(referral, cut);
      await supabase.from("affiliates").upsert(
        { wallet: referral, earned: cut },
        { onConflict: "wallet" }
      );
    }

    return NextResponse.json({ ok: true, tx: tx.transactionHash });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.toString() }, { status: 500 });
  }
}
