import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useLang();

  const opt = (l: Lang, label: string) => (
    <button
      type="button"
      onClick={() => setLang(l)}
      aria-pressed={lang === l}
      className={`px-2.5 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase transition-colors ${
        lang === l
          ? "bg-foreground/10 text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center border border-hairline rounded-full p-0.5 bg-surface/40 backdrop-blur">
      {opt("es", "ES")}
      {opt("en", "EN")}
    </div>
  );
}
