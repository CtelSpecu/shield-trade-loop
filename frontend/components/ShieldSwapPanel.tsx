"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, ArrowUpDown } from "lucide-react";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useShieldTrade } from "@/hooks/useShieldTrade";
import { useOperationLog } from "@/hooks/useOperationLog";
import { useEnsureSepoliaRpc } from "@/hooks/metamask/useEnsureSepoliaRpc";

export function ShieldSwapPanel() {
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const { instance: fhevmInstance } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const shieldTrade = useShieldTrade({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const { add: addLog } = useOperationLog();
  const lastMessageRef = useRef<string>("");

  // Guard MetaMask Sepolia RPC issues by prompting a fallback RPC chain
  useEnsureSepoliaRpc({ provider, chainId });

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    const fa = fromAmount;
    setFromAmount(toAmount);
    setToAmount(fa);
  };

  const submitEncrypted = () => {
    const pay = parseInt(fromAmount || "0", 10);
    const recv = parseInt(toAmount || "0", 10);
    if (!Number.isFinite(pay) || !Number.isFinite(recv)) return;
    if (pay <= 0 || recv <= 0) return;
    addLog({ type: "offer_create", title: "Submit Encrypted Offer", details: `pay=${pay}, recv=${recv}` });
    shieldTrade.setOffer(pay, recv);
  };

  // Mirror shieldTrade messages into operation log with lightweight parsing
  useEffect(() => {
    const m = shieldTrade.message || "";
    if (!m || m === lastMessageRef.current) return;
    lastMessageRef.current = m;

    if (m.startsWith("Offer decrypted:")) {
      addLog({ type: "decrypt", title: "Decryption Completed", details: m.replace("Offer decrypted: ", "") });
    } else if (m.startsWith("setOffer completed")) {
      addLog({ type: "offer_create", title: "Offer Submitted", details: `payHandle=${shieldTrade.payHandle}\nrecvHandle=${shieldTrade.recvHandle}` });
    } else if (m.toLowerCase().includes("failed")) {
      addLog({ type: "error", title: "Operation Failed", details: m });
    } else if (m) {
      addLog({ type: "info", title: "Status Update", details: m });
    }
  }, [shieldTrade.message, shieldTrade.payHandle, shieldTrade.recvHandle, addLog]);

  return (
    <div className="card w-full max-w-xl bg-base-100 shadow-xl border">
      <div className="card-body">
        <h2 className="card-title">Create Encrypted Swap</h2>

        <div className="grid grid-cols-1 gap-4">
          {/* From section */}
          <div>
            <div className="label">
              <span className="label-text">You Pay</span>
              <select
                className="select select-bordered select-sm"
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="DAI">DAI</option>
                <option value="WBTC">WBTC</option>
              </select>
            </div>
            <input
              type="number"
              placeholder="0.00"
              className="input input-bordered w-full"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              min={0}
            />
          </div>

          {/* Swap toggle */}
          <div className="flex justify-center">
            <button className="btn btn-circle" type="button" onClick={handleSwapTokens} aria-label="swap">
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          {/* To section */}
          <div>
            <div className="label">
              <span className="label-text">You Receive</span>
              <select
                className="select select-bordered select-sm"
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
              >
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
                <option value="DAI">DAI</option>
                <option value="ETH">ETH</option>
                <option value="WBTC">WBTC</option>
              </select>
            </div>
            <input
              type="number"
              placeholder="0.00"
              className="input input-bordered w-full"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              min={0}
            />
          </div>

          {/* Privacy info */}
          <div className="alert">
            <Shield className="w-5 h-5" />
            <div>
              <h3 className="font-bold">Protected Trade</h3>
              <div className="text-sm opacity-70">Trade size is encrypted until settlement to resist MEV.</div>
            </div>
          </div>
        </div>

        <div className="card-actions mt-2 justify-end">
          <button
            className="btn btn-primary"
            type="button"
            disabled={!isConnected || !shieldTrade.canSetOffer}
            onClick={submitEncrypted}
          >
            {isConnected ? (shieldTrade.isSubmitting ? "Submitting..." : "Create Encrypted Swap") : "Connect Wallet"}
          </button>
          <button
            className="btn"
            type="button"
            disabled={!shieldTrade.canDecrypt}
            onClick={shieldTrade.decryptOfferHandles}
          >
            {shieldTrade.canDecrypt
              ? "Decrypt Latest"
              : shieldTrade.isDecrypted
                ? `Decrypted: pay=${String(shieldTrade.clear?.pay)} recv=${String(shieldTrade.clear?.recv)}`
                : "Decrypt Disabled"}
          </button>
        </div>

        {/* Status */}
        <div className="text-xs text-base-content/70">
          {shieldTrade.message}
        </div>
      </div>
    </div>
  );
}

