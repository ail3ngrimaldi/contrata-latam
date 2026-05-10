import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/lang-context";
import { Copy, Check } from "lucide-react";

export function AuthButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const solanaWallet = wallets[0];
  const address = solanaWallet?.address ?? null;
  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : null;

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!ready) {
    return (
      <div className="hidden sm:inline-block h-8 w-32 border border-hairline opacity-30" />
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="hidden sm:inline-block text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
        >
          Dashboard
        </Link>
        <Link
          to="/create-contract"
          className="hidden sm:inline-block text-[11px] font-mono border border-laser text-laser px-4 py-2 hover:bg-laser hover:text-background transition-all uppercase tracking-widest"
        >
          {t.nav.cta}
        </Link>
        <div className="hidden sm:flex items-center border border-hairline">
          <button
            onClick={copyAddress}
            title={address ?? ""}
            className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest px-3 py-2"
          >
            {copied
              ? <Check className="h-3 w-3 text-emerald-400" />
              : <Copy className="h-3 w-3" />
            }
            {shortAddress ?? "···"}
          </button>
          <button
            onClick={logout}
            title="Sign out"
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest px-3 py-2 border-l border-hairline"
          >
            Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="hidden sm:inline-block text-[11px] font-mono border border-laser text-laser px-4 py-2 hover:bg-laser hover:text-background transition-all uppercase tracking-widest"
    >
      {t.nav.cta}
    </button>
  );
}
