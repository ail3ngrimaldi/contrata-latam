import { PrivyProvider } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

const rpcUrl = import.meta.env.VITE_SOLANA_RPC ?? "https://api.devnet.solana.com";
const wsUrl = rpcUrl.replace(/^https/, "wss").replace(/^http/, "ws");

export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID as string;
  const clientId = import.meta.env.VITE_PRIVY_CLIENT_ID as string | undefined;

  if (!appId) {
    console.warn("VITE_PRIVY_APP_ID is not set. Auth will not work.");
  }

  return (
    <PrivyProvider
      appId={appId ?? "placeholder"}
      {...(clientId ? { clientId } : {})}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#FF6B35",
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        loginMethods: ["email", "google"],
        solana: {
          rpcs: {
            "solana:devnet": {
              rpc: createSolanaRpc(rpcUrl),
              rpcSubscriptions: createSolanaRpcSubscriptions(wsUrl),
            },
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
