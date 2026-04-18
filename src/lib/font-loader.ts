/**
 * FOIT/FOUT mitigation:
 * - Uses the Font Loading API to detect when our web fonts are ready.
 * - Adds .fonts-loaded on <html> so we can swap from system fallback
 *   to the web font without a flash of invisible text.
 * - The fallback font in styles.css is a system stack with similar
 *   metrics to Geist, so the swap is barely perceptible (FOUT-safe).
 */
export function initFontLoader() {
  if (typeof window === "undefined") return;
  const doc = window.document;
  const fontFaceSet = (doc as Document & { fonts?: FontFaceSet }).fonts;
  if (!fontFaceSet) {
    doc.documentElement.classList.add("fonts-loaded");
    return;
  }

  Promise.all([
    fontFaceSet.load("400 1em Geist"),
    fontFaceSet.load("600 1em Geist"),
    fontFaceSet.load("400 1em 'IBM Plex Mono'"),
  ])
    .then(() => doc.documentElement.classList.add("fonts-loaded"))
    .catch(() => doc.documentElement.classList.add("fonts-loaded"));
}
