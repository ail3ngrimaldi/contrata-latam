import { Logo } from "./Logo";
import { useLang } from "@/lib/lang-context";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <Logo className="h-5 w-5" />
          <span className="font-mono font-semibold tracking-tighter text-foreground text-sm">
            CONTRATA
          </span>
          <span className="ml-3 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest hidden md:inline">
            {t.footer.tagline}
          </span>
        </div>
        <div className="flex gap-8 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          {t.footer.links.map((l) => (
            <a key={l} href="#" className="hover:text-laser transition-colors">
              {l}
            </a>
          ))}
        </div>
        <div className="text-[10px] font-mono text-muted-foreground/60 tracking-widest uppercase">
          {t.footer.copy}
        </div>
      </div>
    </footer>
  );
}
