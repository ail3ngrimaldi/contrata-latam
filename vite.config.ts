// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nodePolyfills } from "vite-plugin-node-polyfills";

/** Polyfills map node:stream/web → stream-browserify/web, but that path is not a real file. */
function isStreamBrowserifyWeb(id: string): boolean {
  const n = id.replace(/\\/g, "/");
  return n === "stream-browserify/web" || n.endsWith("/stream-browserify/web");
}

const streamBrowserifyWebShim = `
const g = typeof globalThis !== "undefined" ? globalThis : {};
export const ReadableStream = g.ReadableStream;
export const WritableStream = g.WritableStream;
export const TransformStream = g.TransformStream;
export const ByteLengthQueuingStrategy = g.ByteLengthQueuingStrategy;
export const CountQueuingStrategy = g.CountQueuingStrategy;
export const TextEncoderStream = g.TextEncoderStream;
export const TextDecoderStream = g.TextDecoderStream;
`;

export default defineConfig({
  vite: {
    plugins: [
      nodePolyfills({ include: ["buffer", "crypto", "stream", "util"] }),
      {
        name: "stub-stream-browserify-web",
        enforce: "pre",
        resolveId(id) {
          if (isStreamBrowserifyWeb(id)) return id;
        },
        load(id) {
          if (isStreamBrowserifyWeb(id)) return streamBrowserifyWebShim;
        },
      },
    ],
  },
});
