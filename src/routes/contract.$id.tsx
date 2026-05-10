import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets, useSignAndSendTransaction } from "@privy-io/react-auth/solana";
import { Connection } from "@solana/web3.js";
import bs58 from "bs58";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  fetchEscrowByAddress,
  buildCancelEscrowTx,
  escrowStatusLabel,
  type EscrowData,
  RPC,
} from "@/lib/anchor-client";
import { ArrowLeft, CheckCircle, Clock, ExternalLink, Loader2, XCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const Route = createFileRoute("/contract/$id")({
  component: ContractDetail,
});

const STATUS_STYLES: Record<string, string> = {
  Active:    "text-laser border-laser/40 bg-laser/10",
  Approved:  "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
  Rejected:  "text-red-400 border-red-400/40 bg-red-400/10",
  Cancelled: "text-muted-foreground border-hairline bg-surface/40",
  Unknown:   "text-muted-foreground border-hairline bg-surface/40",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-3 border-b border-hairline last:border-0">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground shrink-0">
        {label}
      </span>
      <span className="text-xs font-mono text-foreground text-right break-all">{value}</span>
    </div>
  );
}

type FlowStep = "created" | "submitted" | "resolved";

function StatusFlow({
  status,
  hasSubmission,
}: {
  status: string | null;
  hasSubmission: boolean;
}) {
  const isResolved = status === "Approved" || status === "Rejected" || status === "Cancelled";

  const current: FlowStep = isResolved
    ? "resolved"
    : hasSubmission
    ? "submitted"
    : "created";

  const resolvedLabel =
    status === "Approved" ? "Approved" : status === "Rejected" ? "Rejected" : "Cancelled";
  const resolvedColor =
    status === "Approved"
      ? "text-emerald-400 border-emerald-400"
      : status === "Rejected" || status === "Cancelled"
      ? "text-red-400 border-red-400"
      : "text-muted-foreground border-hairline";

  type StepDef = { key: FlowStep; label: string; icon: React.ReactNode };
  const steps: StepDef[] = [
    { key: "created",  label: "Contract created",    icon: <CheckCircle className="h-3.5 w-3.5" /> },
    { key: "submitted", label: "Work submitted",     icon: hasSubmission ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" /> },
    { key: "resolved",  label: isResolved ? resolvedLabel : "Pending review", icon: isResolved ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" /> },
  ];

  function stepState(key: FlowStep): "done" | "active" | "pending" {
    const order: FlowStep[] = ["created", "submitted", "resolved"];
    const ci = order.indexOf(current);
    const ki = order.indexOf(key);
    if (ki < ci) return "done";
    if (ki === ci) return "active";
    return "pending";
  }

  return (
    <div className="border border-hairline bg-surface/60 backdrop-blur-md p-6">
      <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-5">
        Progress
      </h2>
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => {
          const state = stepState(step.key);
          const isLast = i === steps.length - 1;
          const color =
            state === "done"
              ? "text-emerald-400"
              : state === "active" && step.key === "resolved" && isResolved
              ? resolvedColor.split(" ")[0]
              : state === "active"
              ? "text-foreground"
              : "text-muted-foreground/40";

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`${color} mt-0.5`}>{step.icon}</div>
                {!isLast && (
                  <div className={`w-px flex-1 my-1 ${state === "done" ? "bg-emerald-400/30" : "bg-hairline"}`} />
                )}
              </div>
              <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                <p className={`text-[11px] font-mono ${color}`}>{step.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WorkSubmission {
  link: string;
  note: string;
  submittedAt: number;
}

function ContractDetail() {
  const { id } = Route.useParams();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const [escrow, setEscrow] = useState<EscrowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelTx, setCancelTx] = useState<string | null>(null);

  // Work submission (freelancer)
  const [workLink, setWorkLink] = useState("");
  const [workNote, setWorkNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<WorkSubmission | null>(null);

  // Approve / Reject (client)
  const [judging, setJudging] = useState<"approve" | "reject" | null>(null);
  const [judgeError, setJudgeError] = useState<string | null>(null);
  const [judgeTx, setJudgeTx] = useState<{ sig: string; action: "approve" | "reject" } | null>(null);

  const makerWallet = wallets[0];
  const isMaker = escrow && makerWallet?.address === escrow.maker.toBase58();
  const isTaker = escrow && makerWallet?.address === escrow.taker.toBase58();
  const status = escrow ? escrowStatusLabel(escrow.status) : null;
  const explorerUrl = `https://explorer.solana.com/address/${id}?cluster=devnet`;

  const CANCEL_WINDOW_MS = 72 * 60 * 60 * 1000;
  const withinCancelWindow = escrow
    ? Date.now() - escrow.createdAt.toNumber() * 1000 < CANCEL_WINDOW_MS
    : false;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [data, sub] = await Promise.all([
          fetchEscrowByAddress(id),
          fetch(`${API}/work/${id}`).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        setEscrow(data);
        if (sub) setSubmission(sub);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load contract.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleCancel() {
    if (!escrow || !makerWallet) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const { tx, blockhash, lastValidBlockHeight } = await buildCancelEscrowTx({
        makerAddress: makerWallet.address,
        escrow,
      });

      const { signature: sigBytes } = await signAndSendTransaction({
        transaction: tx.serialize({ requireAllSignatures: false }),
        wallet: makerWallet as any,
        chain: "solana:devnet",
      });

      const sig = bs58.encode(sigBytes);
      const connection = new Connection(RPC, "confirmed");
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

      setCancelTx(sig);
      const updated = await fetchEscrowByAddress(id);
      setEscrow(updated);
    } catch (err: any) {
      setCancelError(err?.message ?? "Failed to cancel contract.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleSubmitWork() {
    if (!workLink.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API}/submit-work`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrowAddress: id, link: workLink.trim(), note: workNote.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to submit");
      setSubmission({ link: workLink.trim(), note: workNote.trim(), submittedAt: Date.now() });
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to submit work. Make sure the backend is running.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJudge(action: "approve" | "reject") {
    setJudging(action);
    setJudgeError(null);
    try {
      const res = await fetch(`${API}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrowAddress: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Failed to ${action}`);
      setJudgeTx({ sig: data.signature, action });
      const updated = await fetchEscrowByAddress(id);
      setEscrow(updated);
    } catch (err: any) {
      setJudgeError(err?.message ?? `Failed to ${action} contract.`);
    } finally {
      setJudging(null);
    }
  }

  // ── Loading ──
  if (!ready || loading) {
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

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <p className="text-muted-foreground font-mono text-sm mb-6">{error}</p>
          <Link to="/dashboard" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            ← Back to dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!escrow) return null;

  const amount = (escrow.amount.toNumber() / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 2 });
  const createdDate = new Date(escrow.createdAt.toNumber() * 1000).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <div className="absolute inset-0 technical-grid pointer-events-none opacity-25" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">

          {/* Back */}
          <Link
            to="/dashboard"
            className="mb-8 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface/40 backdrop-blur-sm mb-4">
                <div className={`size-1.5 rounded-full ${status === "Active" ? "bg-laser animate-pulse" : "bg-muted-foreground"}`} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  Contract #{escrow.escrowId.toString()}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-light text-foreground tracking-tight">
                {escrow.title}
              </h1>
            </div>
            <span className={`shrink-0 text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-1 border ${STATUS_STYLES[status!] ?? STATUS_STYLES.Unknown}`}>
              {status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Details */}
            <div className="md:col-span-2 space-y-6">
              <StatusFlow status={status} hasSubmission={!!submission} />

              <div className="border border-hairline bg-surface/60 backdrop-blur-md p-6">
                <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Description
                </h2>
                <p className="text-sm font-mono text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {escrow.description}
                </p>
              </div>

              <div className="border border-hairline bg-surface/60 backdrop-blur-md p-6">
                <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Details
                </h2>
                <Row label="Amount" value={`$${amount} USDC`} />
                <Row label="Client" value={escrow.maker.toBase58()} />
                <Row label="Freelancer" value={escrow.taker.toBase58()} />
                <Row label="Created" value={createdDate} />
                <Row label="Mint" value={escrow.mint.toBase58()} />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-hairline bg-surface/40 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                View on Explorer
                <ExternalLink className="h-3 w-3" />
              </a>

              {/* Cancel success */}
              {cancelTx && (
                <div className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-[11px] font-mono text-emerald-400 flex flex-col gap-2">
                  <span>Contract cancelled. USDC refunded to your wallet.</span>
                  <a
                    href={`https://explorer.solana.com/tx/${cancelTx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-400/70 hover:text-emerald-400 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View transaction
                  </a>
                </div>
              )}

              {cancelError && (
                <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] font-mono text-red-400">
                  {cancelError}
                </div>
              )}

              {/* Judge result */}
              {judgeTx && (
                <div className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-[11px] font-mono text-emerald-400 flex flex-col gap-2">
                  <span>
                    {judgeTx.action === "approve"
                      ? "Contract approved. USDC released to the freelancer."
                      : "Contract rejected. USDC refunded to your wallet."}
                  </span>
                  <a
                    href={`https://explorer.solana.com/tx/${judgeTx.sig}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-400/70 hover:text-emerald-400 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View transaction
                  </a>
                </div>
              )}

              {judgeError && (
                <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] font-mono text-red-400">
                  {judgeError}
                </div>
              )}

              {/* Waiting for freelancer — client, active, no submission yet */}
              {authenticated && isMaker && status === "Active" && !submission && !judgeTx && (
                <div className="flex items-start gap-2.5 border border-hairline bg-surface/40 px-4 py-3">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                    Waiting for the freelancer to submit their work.
                  </p>
                </div>
              )}

              {/* Approve / Reject — client, work submitted, active */}
              {authenticated && isMaker && status === "Active" && submission && !judgeTx && (
                <div className="flex flex-col gap-2">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                    Freelancer submitted work
                  </p>
                  <button
                    onClick={() => handleJudge("approve")}
                    disabled={!!judging}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-4 py-3 text-[10px] font-mono uppercase tracking-widest hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {judging === "approve" ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Approving...</>
                    ) : (
                      <><CheckCircle className="h-3.5 w-3.5" /> Approve & release</>
                    )}
                  </button>
                  <button
                    onClick={() => handleJudge("reject")}
                    disabled={!!judging}
                    className="w-full flex items-center justify-center gap-2 border border-red-500/40 text-red-400 px-4 py-3 text-[10px] font-mono uppercase tracking-widest hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {judging === "reject" ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Rejecting...</>
                    ) : (
                      <><XCircle className="h-3.5 w-3.5" /> Reject</>
                    )}
                  </button>
                </div>
              )}

              {/* Cancel — client, active, within window */}
              {authenticated && isMaker && status === "Active" && !cancelTx && !judgeTx && withinCancelWindow && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 border border-hairline text-muted-foreground px-4 py-3 text-[10px] font-mono uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Cancelling...</>
                  ) : (
                    <><XCircle className="h-3.5 w-3.5" /> Cancel contract</>
                  )}
                </button>
              )}

              {authenticated && isMaker && status === "Active" && !cancelTx && !judgeTx && !withinCancelWindow && (
                <p className="text-[10px] font-mono text-muted-foreground text-center py-2">
                  Cancellation window closed (72 h).
                </p>
              )}

              {!authenticated && status === "Active" && (
                <p className="text-[10px] font-mono text-muted-foreground text-center py-2">
                  Sign in to manage this contract.
                </p>
              )}
            </div>
          </div>

          {/* Work submission — shown to both parties */}
          {submission && (
            <div className="mt-6 border border-hairline bg-surface/60 backdrop-blur-md p-6">
              <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Work delivered
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                    Delivery link
                  </div>
                  <a
                    href={submission.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-laser hover:underline break-all"
                  >
                    {submission.link}
                  </a>
                </div>
                {submission.note && (
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Notes
                    </div>
                    <p className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
                      {submission.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit work form — freelancer only, active, not yet submitted */}
          {authenticated && isTaker && status === "Active" && !submission && (
            <div className="mt-6 border border-hairline bg-surface/60 backdrop-blur-md p-6">
              <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-5">
                Submit your work
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                    Delivery link
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={workLink}
                    onChange={(e) => setWorkLink(e.target.value)}
                    className="w-full bg-background border border-hairline px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what you delivered..."
                    value={workNote}
                    onChange={(e) => setWorkNote(e.target.value)}
                    className="w-full bg-background border border-hairline px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/30 resize-none"
                  />
                </div>
                {submitError && (
                  <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] font-mono text-red-400">
                    {submitError}
                  </div>
                )}
                <button
                  onClick={handleSubmitWork}
                  disabled={!workLink.trim() || submitting}
                  className="self-start inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest hover:bg-laser hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...</>
                  ) : "Submit work"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
