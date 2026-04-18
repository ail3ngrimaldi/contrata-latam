/**
 * FOIT/FOUT mitigation:
 * - Uses the Font Loading API to detect when our web fonts are ready.
 * - Adds .fonts-loaded on <html> so we can swap from system fallback
 *   to the web font without a flash of invisible text.
 * - The fallback font in styles.css is a system stack with similar
 *   metrics to Geist, so the swap is barely perceptible (FOUT-safe).
 */
export function initFontLoader() {
  if (typeof document === "undefined") return;
  const doc = document as Document;
  if (!("fonts" in doc)) {
    doc.documentElement.classList.add("fonts-loaded");
    return;
  }

  Promise.all([
    document.fonts.load("400 1em Geist"),
    document.fonts.load("600 1em Geist"),
    document.fonts.load("400 1em 'IBM Plex Mono'"),
  ])
    .then(() => {
      document.documentElement.classList.add("fonts-loaded");
    })
    .catch(() => {
      // On failure, still reveal text using system fallback.
      document.documentElement.classList.add("fonts-loaded");
    });
}
