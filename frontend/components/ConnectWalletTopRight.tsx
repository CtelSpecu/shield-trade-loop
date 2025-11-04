"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWalletTopRight() {
  return (
    <div className="flex items-center">
      <ConnectButton
        label="Connect Wallet"
        accountStatus="avatar"
        chainStatus="full"
        showBalance={false}
      />
    </div>
  );
}
