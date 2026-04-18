import { Logo } from "./Logo";
import { LangToggle } from "./LangToggle";
import { useLang } from "@/lib/lang-context";

export function Header() {
  const { t } = useLang();
  return (
    <nav className="relative z-20 border-b border-hairline backdrop-blur-md bg-background/60 sticky top-0">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 group">
          <Logo className="h-6 w-6 transition-transform group-hover:rotate-3" />
          <span className="font-mono font-semibold tracking-tighter text-foreground text-base">
            CONTRATA
          </span>
        </a>
        <div className="hidden md:flex gap-8 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <a href="#how" className="hover:text-laser transition-colors">{t.nav.protocol}</a>
          <a href="#diff" className="hover:text-laser transition-colors">{t.nav.arbitration}</a>
          <a href="#faq" className="hover:text-laser transition-colors">{t.nav.faq}</a>
        </div>
        <div className="flex items-center gap-3">
          <LangToggle />
          <a
            href="#waitlist"
            className="hidden sm:inline-block text-[11px] font-mono border border-laser text-laser px-4 py-2 hover:bg-laser hover:text-background transition-all uppercase tracking-widest"
          >
            {t.nav.cta}
          </a>
        </div>
      </div>
    </nav>
  );
}
