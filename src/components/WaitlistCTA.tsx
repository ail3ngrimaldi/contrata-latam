import { useLang } from "@/lib/lang-context";
import { WaitlistForm } from "./WaitlistForm";

export function WaitlistCTA() {
  const { t } = useLang();
  return (
    <section id="waitlist" className="relative border-y border-hairline overflow-hidden">
      <div className="absolute inset-0 technical-grid pointer-events-none opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] lens-flare pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
        <div className="font-mono text-laser text-xs tracking-widest uppercase mb-6">
          {t.waitlist.eyebrow}
        </div>
        <h2 className="font-light text-4xl md:text-6xl text-foreground tracking-tight leading-[1.05] mb-6 text-balance">
          {t.waitlist.title}
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
          {t.waitlist.copy}
        </p>
        <WaitlistForm variant="large" />
      </div>
    </section>
  );
}
