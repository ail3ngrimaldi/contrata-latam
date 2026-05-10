import React, { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets, useSignAndSendTransaction } from "@privy-io/react-auth/solana";
import { Connection } from "@solana/web3.js";
import bs58 from "bs58";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildCreateEscrowTx, RPC } from "@/lib/anchor-client";
import {
  FileText,
  Wallet,
  DollarSign,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle,
  LogIn,
  Loader2,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/create-contract")({
  component: CreateContract,
});

// ── Login gate ────────────────────────────────────────────────────────────────

function LoginGate({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 technical-grid pointer-events-none opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] lens-flare pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface/40 backdrop-blur-sm mb-8">
            <div className="size-1.5 rounded-full bg-laser animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Beta privada · Acceso restringido
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-4">
            Inicia sesión para continuar
          </h1>
          <p className="text-muted-foreground font-mono text-sm mb-12 max-w-[45ch] mx-auto leading-relaxed">
            Usamos tu cuenta para crear tu wallet automáticamente. No necesitas
            instalar ninguna extensión.
          </p>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-xs font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            Acceder con email o Google
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({
  onBack,
  txSig,
  escrowAddress,
}: {
  onBack: () => void;
  txSig: string | null;
  escrowAddress: string | null;
}) {
  const explorerUrl = txSig
    ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 technical-grid pointer-events-none opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] lens-flare pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 border border-laser/30 bg-laser/10 mb-8 mx-auto">
            <CheckCircle className="h-6 w-6 text-laser" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface/40 backdrop-blur-sm mb-6">
            <div className="size-1.5 rounded-full bg-laser animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Contrato registrado · Dinero bloqueado
            </span>
          </div>
          <h1 className="text-4xl font-light text-foreground tracking-tight mb-4">
            Tu contrato está listo.
          </h1>
          <p className="text-muted-foreground font-mono text-sm mb-10 max-w-[45ch] mx-auto leading-relaxed">
            El dinero quedó bloqueado. Se liberará al freelancer una vez que confirmes que el trabajo fue entregado.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            {escrowAddress && (
              <Link
                to="/contract/$id"
                params={{ id: escrowAddress }}
                className="bg-foreground text-background px-7 py-3 text-xs font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors"
              >
                Ver contrato
              </Link>
            )}
            <Link
              to="/dashboard"
              className="border border-hairline text-muted-foreground px-7 py-3 text-xs font-mono uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              Mis contratos
            </Link>
            <button
              onClick={onBack}
              className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors px-4 py-3"
            >
              Inicio
            </button>
          </div>

          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-hairline bg-surface/40 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Ver transacción en Explorer
            </a>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function CreateContract() {
  const navigate = useNavigate();
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [escrowAddress, setEscrowAddress] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    freelancerWallet: "",
    amount: "",
    deadline: "",
  });

  // Privy embedded Solana wallet for the logged-in user (the maker / client)
  const makerWallet = wallets[0];
  const makerAddress = makerWallet?.address ?? "";
  const shortMaker = makerAddress
    ? `${makerAddress.slice(0, 6)}...${makerAddress.slice(-4)}`
    : "···";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!makerWallet) return;
    setLoading(true);
    setTxError(null);
    try {
      const { tx, blockhash, lastValidBlockHeight, escrowAddress: addr } = await buildCreateEscrowTx({
        makerAddress: makerWallet.address,
        taker: form.freelancerWallet,
        amount: Number(form.amount),
        title: form.title,
        description: form.description,
      });

      const { signature: sigBytes } = await signAndSendTransaction({
        transaction: tx.serialize({ requireAllSignatures: false }),
        wallet: makerWallet as any,
        chain: "solana:devnet",
      });

      const sig = bs58.encode(sigBytes);
      const connection = new Connection(RPC, "confirmed");
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });

      setTxSig(sig);
      setEscrowAddress(addr);
      setSubmitted(true);
    } catch (err: any) {
      const logs: string[] | undefined = err?.context?.logs ?? err?.logs;
      const logSummary = logs?.length ? `\n\nLogs: ${logs.join(" | ")}` : "";
      console.error("createEscrow error", err);
      setTxError((err?.message ?? "Error al crear el contrato.") + logSummary);
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid =
    form.title.trim() !== "" && form.description.trim() !== "";
  const isStep2Valid = form.freelancerWallet.trim() !== "";
  const isStep3Valid =
    form.amount !== "" && Number(form.amount) > 0 && form.deadline !== "";

  // Loading state while Privy initialises
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

  if (!authenticated) {
    return <LoginGate onLogin={login} />;
  }

  if (submitted) {
    return <SuccessScreen onBack={() => navigate({ to: "/" })} txSig={txSig} escrowAddress={escrowAddress} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        <div className="absolute inset-0 technical-grid pointer-events-none opacity-25" />
        <div className="relative max-w-2xl mx-auto px-6 py-16 md:py-24">

          {/* Page header */}
          <div className="mb-10">
            <button
              onClick={() => navigate({ to: "/" })}
              className="mb-6 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface/40 backdrop-blur-sm mb-6">
              <div className="size-1.5 rounded-full bg-laser animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Beta privada · Nuevo contrato
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-3">
              Crear contrato
            </h1>
            <p className="text-muted-foreground font-mono text-sm leading-relaxed">
              Configura un contrato escrow seguro para tu proyecto.
            </p>
          </div>

          {/* Connected wallet pill */}
          <div className="mb-8 flex items-center gap-2 border border-hairline bg-surface/40 px-4 py-2.5 w-fit">
            <div className="size-1.5 rounded-full bg-laser" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Tu wallet:
            </span>
            <span className="text-[10px] font-mono text-foreground">
              {shortMaker}
            </span>
          </div>

          {/* Step indicator */}
          <div className="mb-10 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <button
                  type="button"
                  onClick={() => s < step && setStep(s)}
                  className={`flex h-8 w-8 items-center justify-center text-xs font-mono font-semibold transition-all border ${
                    s === step
                      ? "bg-laser text-background border-laser"
                      : s < step
                        ? "bg-surface border-laser/40 text-laser cursor-pointer"
                        : "bg-transparent border-hairline text-muted-foreground cursor-default"
                  }`}
                >
                  {s}
                </button>
                {s < 3 && (
                  <div
                    className={`h-px flex-1 transition-colors ${s < step ? "bg-laser/40" : "bg-hairline"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit}>

            {/* Step 1 — Job Details */}
            {step === 1 && (
              <div className="animate-in fade-in duration-300 border border-hairline bg-surface/60 backdrop-blur-md p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-hairline">
                  <div className="flex h-9 w-9 items-center justify-center border border-laser/30 bg-laser/10 shrink-0">
                    <FileText className="h-4 w-4 text-laser" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-mono font-semibold text-foreground uppercase tracking-widest">
                      Detalles del trabajo
                    </h2>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      Describe el trabajo a realizar.
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="title"
                      className="block mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      Título del contrato
                    </label>
                    <input
                      id="title"
                      name="title"
                      placeholder="ej. Dashboard DeFi Frontend"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full h-11 border border-hairline bg-background/60 px-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-laser/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      Descripción del trabajo
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Describe el alcance, entregables y requisitos en detalle. La IA usará esto para verificar la entrega."
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                      className="w-full border border-hairline bg-background/60 px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-laser/50 transition-colors resize-none"
                    />
                    <div className="mt-2 flex items-start gap-1.5 text-[10px] font-mono text-muted-foreground/60">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        Sé lo más detallado posible. La IA usará esta
                        descripción para evaluar entregas.
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Valid}
                      className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continuar
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Freelancer */}
            {step === 2 && (
              <div className="animate-in fade-in duration-300 border border-hairline bg-surface/60 backdrop-blur-md p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-hairline">
                  <div className="flex h-9 w-9 items-center justify-center border border-laser/30 bg-laser/10 shrink-0">
                    <Wallet className="h-4 w-4 text-laser" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-mono font-semibold text-foreground uppercase tracking-widest">
                      Freelancer
                    </h2>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      Wallet Solana de quien va a ejecutar el trabajo.
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  {/* Maker (read-only) */}
                  <div>
                    <label className="block mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Tu wallet (cliente)
                    </label>
                    <div className="flex items-center gap-2 h-11 border border-hairline bg-surface/40 px-4">
                      <div className="size-1.5 rounded-full bg-laser shrink-0" />
                      <span className="text-sm font-mono text-muted-foreground truncate">
                        {makerAddress}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] font-mono text-muted-foreground/50">
                      Asignada automáticamente desde tu cuenta.
                    </p>
                  </div>

                  {/* Freelancer wallet (manual entry) */}
                  <div>
                    <label
                      htmlFor="freelancerWallet"
                      className="block mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      Wallet del freelancer
                    </label>
                    <input
                      id="freelancerWallet"
                      name="freelancerWallet"
                      placeholder="ej. 3bFRj2vN..."
                      value={form.freelancerWallet}
                      onChange={handleChange}
                      className="w-full h-11 border border-hairline bg-background/60 px-4 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-laser/50 transition-colors"
                    />
                    <div className="mt-2 flex items-start gap-1.5 text-[10px] font-mono text-muted-foreground/60">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>
                        Pídele al freelancer que cree su cuenta en Contrata
                        para obtener su dirección.
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 border border-hairline text-muted-foreground px-6 py-3 text-[10px] font-mono uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!isStep2Valid}
                      className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continuar
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Payment & Deadline */}
            {step === 3 && (
              <div className="animate-in fade-in duration-300 border border-hairline bg-surface/60 backdrop-blur-md p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-hairline">
                  <div className="flex h-9 w-9 items-center justify-center border border-laser/30 bg-laser/10 shrink-0">
                    <DollarSign className="h-4 w-4 text-laser" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-mono font-semibold text-foreground uppercase tracking-widest">
                      Pago y fecha límite
                    </h2>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      Define el monto USDC y la fecha de entrega.
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="amount"
                      className="block mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      Monto USDC
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground pointer-events-none">
                        $
                      </span>
                      <input
                        id="amount"
                        name="amount"
                        type="number"
                        min="1"
                        placeholder="2500"
                        value={form.amount}
                        onChange={handleChange}
                        className="w-full h-11 border border-hairline bg-background/60 pl-8 pr-16 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-laser/50 transition-colors"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 pointer-events-none">
                        USDC
                      </span>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="deadline"
                      className="block mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      Fecha límite
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={form.deadline}
                        onChange={handleChange}
                        className="w-full h-11 border border-hairline bg-background/60 pl-11 pr-4 text-sm font-mono text-foreground focus:outline-none focus:border-laser/50 transition-colors scheme-dark"
                      />
                    </div>
                  </div>

                  {isStep3Valid && (
                    <div className="border border-hairline bg-surface/40 p-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
                        Resumen
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">Título</span>
                          <span className="text-foreground truncate max-w-[60%] text-right">
                            {form.title}
                          </span>
                        </div>
                        <div className="w-full h-px bg-hairline" />
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">Cliente</span>
                          <span className="text-foreground">{shortMaker}</span>
                        </div>
                        <div className="w-full h-px bg-hairline" />
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">Monto</span>
                          <span className="text-laser">
                            ${Number(form.amount).toLocaleString("es-AR")} USDC
                          </span>
                        </div>
                        <div className="w-full h-px bg-hairline" />
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-muted-foreground">
                            Fecha límite
                          </span>
                          <span className="text-foreground">
                            {new Date(
                              form.deadline + "T00:00:00"
                            ).toLocaleDateString("es-AR", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {txError && (
                    <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] font-mono text-red-400 leading-relaxed">
                      {txError}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 border border-hairline text-muted-foreground px-6 py-3 text-[10px] font-mono uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={!isStep3Valid || loading}
                      className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-[10px] font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Crear contrato
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
