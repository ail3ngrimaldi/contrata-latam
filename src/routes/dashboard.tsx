import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  fetchMakerEscrows,
  fetchTakerEscrows,
  escrowStatusLabel,
  type EscrowData,
} from "@/lib/anchor-client";
import { LogIn, Plus, ExternalLink, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const STATUS_STYLES: Record<string, string> = {
  Active:    "text-laser border-laser/40 bg-laser/10",
  Approved:  "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  Rejected:  "text-red-400 border-red-400/40 bg-red-400/10",
  Cancelled: "text-muted-foreground border-hairline bg-surface/40",
  Unknown:   "text-muted-foreground border-hairline bg-surface/40",
};

function formatUsdc(amount: { toNumber(): number }): string {
  return (amount.toNumber() / 1_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(ts: { toNumber(): number }): string {
  return new Date(ts.toNumber() * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function short(address: { toBase58(): string }): string {
  const s = address.toBase58();
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}

// ── Login gate ────────────────────────────────────────────────────────────────

function LoginGate({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 technical-grid pointer-events-none opacity-25" />
        <div className="relative max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-light text-foreground tracking-tight mb-4">
            Sign in to view your contracts
          </h1>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-xs font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in with email or Google
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Contract card ─────────────────────────────────────────────────────────────

function ContractCard({ escrow, role }: { escrow: EscrowData; role: "client" | "freelancer" }) {
  const status = escrowStatusLabel(escrow.status);
  const explorerUrl = `https://explorer.solana.com/address/${escrow.publicKey.toBase58()}?cluster=devnet`;
  const detailPath = `/contract/${escrow.publicKey.toBase58()}`;

  return (
    <div className="border border-hairline bg-surface/60 backdrop-blur-md flex flex-col">
      <Link
        to={detailPath}
        className="p-5 flex flex-col gap-4 hover:bg-surface/80 transition-colors flex-1"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-mono font-semibold text-foreground truncate flex-1">
            {escrow.title}
          </h3>
          <span className={`shrink-0 text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 border ${STATUS_STYLES[status] ?? STATUS_STYLES.Unknown}`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono">
          <div>
            <div className="text-muted-foreground uppercase tracking-widest mb-0.5 text-[9px]">Amount</div>
            <div className="text-laser font-semibold">${formatUsdc(escrow.amount)} USDC</div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase tracking-widest mb-0.5 text-[9px]">Created</div>
            <div className="text-foreground">{formatDate(escrow.createdAt)}</div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase tracking-widest mb-0.5 text-[9px]">
              {role === "client" ? "Freelancer" : "Client"}
            </div>
            <div className="text-foreground">
              {role === "client" ? short(escrow.taker) : short(escrow.maker)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground uppercase tracking-widest mb-0.5 text-[9px]">ID</div>
            <div className="text-foreground">#{escrow.escrowId.toString()}</div>
          </div>
        </div>
      </Link>

      <div className="px-5 pb-4">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors w-fit"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3" />
          View on Explorer
        </a>
      </div>
    </div>
  );
}

// ── Contract list ─────────────────────────────────────────────────────────────

function ContractList({
  escrows,
  loading,
  error,
  role,
}: {
  escrows: EscrowData[];
  loading: boolean;
  error: string | null;
  role: "client" | "freelancer";
}) {
  if (loading && escrows.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="size-1.5 rounded-full bg-laser animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] font-mono text-red-400">
        {error}
      </div>
    );
  }

  if (escrows.length === 0) {
    return (
      <div className="border border-hairline bg-surface/40 py-24 text-center">
        <p className="text-muted-foreground font-mono text-sm mb-6">
          {role === "client" ? "No contracts created yet." : "No contracts assigned to you yet."}
        </p>
        {role === "client" && (
          <Link
            to="/create-contract"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create your first contract
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {escrows.map((escrow) => (
        <ContractCard key={escrow.publicKey.toBase58()} escrow={escrow} role={role} />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "client" | "freelancer";

function Dashboard() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();

  const [tab, setTab] = useState<Tab>("client");

  const [clientEscrows, setClientEscrows] = useState<EscrowData[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const [freelancerEscrows, setFreelancerEscrows] = useState<EscrowData[]>([]);
  const [freelancerLoading, setFreelancerLoading] = useState(false);
  const [freelancerError, setFreelancerError] = useState<string | null>(null);

  const walletAddress = wallets[0]?.address;

  async function loadClient() {
    if (!walletAddress) return;
    setClientLoading(true);
    setClientError(null);
    try {
      const result = await fetchMakerEscrows(walletAddress);
      result.sort((a, b) => b.escrowId.toNumber() - a.escrowId.toNumber());
      setClientEscrows(result);
    } catch (err: any) {
      setClientError(err?.message ?? "Failed to load contracts.");
    } finally {
      setClientLoading(false);
    }
  }

  async function loadFreelancer() {
    if (!walletAddress) return;
    setFreelancerLoading(true);
    setFreelancerError(null);
    try {
      const result = await fetchTakerEscrows(walletAddress);
      result.sort((a, b) => b.escrowId.toNumber() - a.escrowId.toNumber());
      setFreelancerEscrows(result);
    } catch (err: any) {
      setFreelancerError(err?.message ?? "Failed to load contracts.");
    } finally {
      setFreelancerLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated && walletAddress) {
      loadClient();
      loadFreelancer();
    }
  }, [authenticated, walletAddress]);

  function refresh() {
    if (tab === "client") loadClient();
    else loadFreelancer();
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-48">
          <div className="size-1.5 rounded-full bg-laser animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!authenticated) return <LoginGate onLogin={login} />;

  const isLoading = tab === "client" ? clientLoading : freelancerLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <div className="absolute inset-0 technical-grid pointer-events-none opacity-25" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">

          {/* Page header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface/40 backdrop-blur-sm mb-4">
                <div className="size-1.5 rounded-full bg-laser animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  My contracts
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refresh}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 border border-hairline text-muted-foreground px-3 py-2 text-[10px] font-mono uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <Link
                to="/create-contract"
                className="inline-flex items-center gap-1.5 bg-foreground text-background px-4 py-2 text-[10px] font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors"
              >
                <Plus className="h-3 w-3" />
                New contract
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-8 border border-hairline w-fit">
            <button
              onClick={() => setTab("client")}
              className={`px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                tab === "client"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              As Client
            </button>
            <button
              onClick={() => setTab("freelancer")}
              className={`px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-colors border-l border-hairline ${
                tab === "freelancer"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              As Freelancer
            </button>
          </div>

          {/* Content */}
          {tab === "client" && (
            <ContractList
              escrows={clientEscrows}
              loading={clientLoading}
              error={clientError}
              role="client"
            />
          )}
          {tab === "freelancer" && (
            <ContractList
              escrows={freelancerEscrows}
              loading={freelancerLoading}
              error={freelancerError}
              role="freelancer"
            />
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
