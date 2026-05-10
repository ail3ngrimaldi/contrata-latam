import { Buffer } from "buffer";
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import idl from "./workspace.idl.json";

const PROGRAM_ID = new PublicKey(idl.address);

export const RPC = import.meta.env.VITE_SOLANA_RPC ?? "https://api.devnet.solana.com";
export const CONFIG_PDA = new PublicKey(import.meta.env.VITE_CONFIG_PDA);
export const USDC_MINT = new PublicKey(
  import.meta.env.VITE_USDC_MINT ?? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

function readonlyProvider(connection: Connection, publicKey: PublicKey) {
  const stub = {
    publicKey,
    signTransaction: async <T>(tx: T): Promise<T> => tx,
    signAllTransactions: async <T>(txs: T[]): Promise<T[]> => txs,
  };
  return new anchor.AnchorProvider(connection, stub as any, { commitment: "confirmed" });
}

export interface EscrowData {
  publicKey: PublicKey;
  maker: PublicKey;
  taker: PublicKey;
  judge: PublicKey;
  mint: PublicKey;
  amount: anchor.BN;
  escrowId: anchor.BN;
  status: Record<string, object>;
  createdAt: anchor.BN;
  resolvedAt: anchor.BN;
  title: string;
  description: string;
}

export function escrowStatusLabel(status: Record<string, object>): string {
  if ("active" in status) return "Active";
  if ("approved" in status) return "Approved";
  if ("rejected" in status) return "Rejected";
  if ("cancelled" in status) return "Cancelled";
  return "Unknown";
}

export async function fetchMakerEscrows(makerAddress: string): Promise<EscrowData[]> {
  const connection = new Connection(RPC, "confirmed");
  const maker = new PublicKey(makerAddress);
  const program = new anchor.Program(idl as any, readonlyProvider(connection, maker));

  const accounts = await (program.account as any).escrow.all([
    { memcmp: { offset: 9, bytes: maker.toBase58() } },
  ]);

  return accounts.map((a: any) => ({ publicKey: a.publicKey, ...a.account }));
}

export async function fetchTakerEscrows(takerAddress: string): Promise<EscrowData[]> {
  const connection = new Connection(RPC, "confirmed");
  const taker = new PublicKey(takerAddress);
  const program = new anchor.Program(idl as any, readonlyProvider(connection, taker));

  // Layout: 8 (discriminator) + 1 (bump) + 32 (maker) = offset 41 for taker
  const accounts = await (program.account as any).escrow.all([
    { memcmp: { offset: 41, bytes: taker.toBase58() } },
  ]);

  return accounts.map((a: any) => ({ publicKey: a.publicKey, ...a.account }));
}

export async function fetchEscrowByAddress(address: string): Promise<EscrowData> {
  const connection = new Connection(RPC, "confirmed");
  const pda = new PublicKey(address);
  const program = new anchor.Program(idl as any, readonlyProvider(connection, pda));
  const account = await (program.account as any).escrow.fetch(pda);
  return { publicKey: pda, ...account };
}

export async function buildCancelEscrowTx(params: {
  makerAddress: string;
  escrow: EscrowData;
}): Promise<BuildEscrowTxResult> {
  const { makerAddress, escrow } = params;
  const connection = new Connection(RPC, "confirmed");
  const maker = new PublicKey(makerAddress);
  const program = new anchor.Program(idl as any, readonlyProvider(connection, maker));

  const idBuf = escrow.escrowId.toArrayLike(Buffer, "le", 8);
  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), maker.toBuffer(), idBuf],
    PROGRAM_ID
  );
  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), maker.toBuffer(), idBuf],
    PROGRAM_ID
  );

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(maker, { mint: escrow.mint });
  if (tokenAccounts.value.length === 0) {
    throw new Error("USDC token account not found. Cannot receive refund.");
  }
  const makerToken = tokenAccounts.value[0].pubkey;

  const tx: Transaction = await (program.methods as any)
    .cancelEscrow()
    .accountsStrict({
      escrow: escrowPDA,
      vault: vaultPDA,
      makerToken,
      mint: escrow.mint,
      maker,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .transaction();

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = maker;

  return { tx, blockhash, lastValidBlockHeight, escrowAddress: escrowPDA.toBase58() };
}

export interface BuildEscrowTxResult {
  tx: Transaction;
  blockhash: string;
  lastValidBlockHeight: number;
  escrowAddress: string;
}

export async function buildCreateEscrowTx(params: {
  makerAddress: string;
  taker: string;
  amount: number;
  title: string;
  description: string;
  mint?: PublicKey;
}): Promise<BuildEscrowTxResult> {
  const { makerAddress, taker, amount, title, description, mint = USDC_MINT } = params;

  const connection = new Connection(RPC, "confirmed");
  const maker = new PublicKey(makerAddress);
  const program = new anchor.Program(idl as any, readonlyProvider(connection, maker));

  const cfg = await (program.account as any).config.fetch(CONFIG_PDA) as { escrowCount: anchor.BN };
  const escrowId: anchor.BN = cfg.escrowCount;
  const idBuf = escrowId.toArrayLike(Buffer, "le", 8);

  const [escrowPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), maker.toBuffer(), idBuf],
    PROGRAM_ID
  );
  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), maker.toBuffer(), idBuf],
    PROGRAM_ID
  );

  // Find the maker's actual token account for this mint (don't assume standard ATA)
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(maker, { mint });
  if (tokenAccounts.value.length === 0) {
    throw new Error(
      `No se encontró ninguna cuenta de USDC para tu wallet en devnet.\n` +
      `Wallet: ${maker.toBase58()}\n` +
      `Mint: ${mint.toBase58()}\n` +
      `Pedí USDC devnet desde faucet.circle.com usando esa wallet.`
    );
  }
  const makerToken = tokenAccounts.value[0].pubkey;

  const amountBn = new anchor.BN(Math.round(amount * 1_000_000));

  const tx: Transaction = await (program.methods as any)
    .createEscrow(escrowId, amountBn, new PublicKey(taker), title, description)
    .accountsStrict({
      config: CONFIG_PDA,
      escrow: escrowPDA,
      vault: vaultPDA,
      makerToken,
      mint,
      maker,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = maker;

  // Pre-simulate to surface the exact error before Privy signs
  const sim = await connection.simulateTransaction(tx.compileMessage());
  if (sim.value.err) {
    console.error("[escrow] simulation logs:", sim.value.logs);
    throw new Error(
      `Simulation failed: ${JSON.stringify(sim.value.err)}\n${sim.value.logs?.join("\n") ?? ""}`
    );
  }

  return { tx, blockhash, lastValidBlockHeight, escrowAddress: escrowPDA.toBase58() };
}
