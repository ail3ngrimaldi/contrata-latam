// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import type { Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// stream-browserify has no `web` subpath; vite-plugin-node-polyfills maps `node:stream/web` →
// .../stream-browserify/web (ENOENT). This plugin intercepts at resolveId (bare specifiers)
// AND load (already-resolved absolute paths) so it works across all Vite environments.
const SHIM_ID = "\0stream-browserify-web-shim";
const SHIM_CONTENT = `
const g = typeof globalThis !== "undefined" ? globalThis : {};
export const ReadableStream = g.ReadableStream;
export const WritableStream = g.WritableStream;
export const TransformStream = g.TransformStream;
export const ByteLengthQueuingStrategy = g.ByteLengthQueuingStrategy;
export const CountQueuingStrategy = g.CountQueuingStrategy;
export const TextEncoderStream = g.TextEncoderStream;
export const TextDecoderStream = g.TextDecoderStream;
`.trim();

const isStreamBrowserifyWeb = (id: string) =>
  id === "node:stream/web" ||
  id === "stream/web" ||
  id === "stream-browserify/web" ||
  /[/\\]stream-browserify[/\\]web$/.test(id);

const streamWebShimPlugin: Plugin = {
  name: "stream-browserify-web-shim",
  enforce: "pre",
  resolveId(id) {
    if (isStreamBrowserifyWeb(id)) return SHIM_ID;
  },
  load(id) {
    if (id === SHIM_ID || isStreamBrowserifyWeb(id)) return SHIM_CONTENT;
  },
};

// On Vercel: disable the Cloudflare Workers plugin; NITRO_PRESET=vercel (set in Vercel dashboard)
// switches TanStack Start's Nitro output to .vercel/output/ format.
const isVercel = !!process.env.VERCEL;

// pino (pulled in by @privy-io/react-auth) calls process.hrtime.bigint() at module init time.
// Cloudflare Workers nodejs_compat does not implement process.hrtime, so the Worker fails
// validation (error 10021).
// resolve.alias is used instead of a virtual-module plugin because pino is pulled in through
// CJS require() chains that bypass Vite's resolveId hook at plugin level.
const pinoStubPath = path.resolve(__dirname, "pino-stub.js");

const pinoStubPlugin: Plugin = {
  name: "pino-stub",
  enforce: "pre",
  resolveId(id) {
    if (
      id === "pino" ||
      id === "pino-std-serializers" ||
      id === "pino-abstract-transport" ||
      id.includes("/pino/") ||
      id.includes("/pino-")
    )
      return pinoStubPath;
  },
};

export default defineConfig({
  cloudflare: isVercel ? false : undefined,
  vite: {
    plugins: [
      streamWebShimPlugin,
      pinoStubPlugin,
      nodePolyfills({ include: ["buffer", "crypto", "stream", "util"] }),
    ],
    resolve: {
      alias: {
        pino: pinoStubPath,
        "pino-std-serializers": pinoStubPath,
        "pino-abstract-transport": pinoStubPath,
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("@coral-xyz/anchor") ||
              id.includes("@solana/web3.js")
            ) {
              return "vendor-solana-legacy";
            }
            if (
              id.includes("@solana/kit") ||
              id.includes("@solana-program/")
            ) {
              return "vendor-solana-kit";
            }
            if (id.includes("@privy-io/")) {
              return "vendor-privy";
            }
            if (id.includes("node_modules/@tanstack/")) {
              return "vendor-tanstack";
            }
            if (id.includes("node_modules/@radix-ui/")) {
              return "vendor-radix";
            }
          },
        },
      },
    },
  },
});
