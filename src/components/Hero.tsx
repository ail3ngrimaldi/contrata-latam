import { useLang } from "@/lib/lang-context";
import { WaitlistForm } from "./WaitlistForm";
import heroImg from "@/assets/contrata-hero.jpg";

export function Hero() {
  const { t } = useLang();
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 technical-grid pointer-events-none opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] lens-flare pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-12 gap-10 items-start">
          <div className="col-span-12 lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface/40 backdrop-blur-sm mb-8">
              <div className="size-1.5 rounded-full bg-laser animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                {t.badge}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-foreground tracking-tight leading-[1.05] mb-8 text-balance">
              {t.hero.title1}{" "}
              <span className="text-muted-foreground/60">{t.hero.title2}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-[55ch] mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <WaitlistForm />
            <p className="mt-4 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              {t.hero.microcopy}
            </p>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <ContractCard heroImg={heroImg} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContractCard({ heroImg }: { heroImg: string }) {
  const { t } = useLang();
  const c = t.contractCard;
  return (
    <div className="relative border border-hairline bg-surface/60 backdrop-blur-md p-6 lg:p-7 group">
      <div className="absolute top-0 right-0 p-3 font-mono text-[10px] text-muted-foreground/50">
        {c.ref}_0492/TX
      </div>

      <div className="aspect-[4/3] w-full overflow-hidden rounded-sm border border-hairline mb-6 relative">
        <img
          src={heroImg}
          alt="Freelancer working on mobile app redesign"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              {c.tag}
            </div>
            <div className="text-sm font-semibold text-foreground">{c.project}</div>
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
              {c.milestone}
            </div>
          </div>
          <span className="px-2.5 py-1 bg-laser/15 text-laser text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm border border-laser/30 whitespace-nowrap">
            {c.status}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
          <span className="text-muted-foreground">{c.amount}</span>
          <span className="text-foreground">$1,450.00 USD</span>
        </div>
        <div className="w-full h-px bg-hairline relative">
          <div className="absolute top-0 left-0 h-px bg-laser w-1/3" />
          <div className="absolute top-1/2 left-1/3 size-1.5 -translate-y-1/2 -translate-x-1/2 bg-laser rounded-full shadow-[0_0_10px_var(--laser)]" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="border border-hairline p-3 bg-background/30">
            <div className="text-[10px] font-mono text-muted-foreground/70 mb-1 uppercase tracking-widest">
              {c.escrowed}
            </div>
            <div className="text-base font-mono text-foreground">$1,450.00</div>
          </div>
          <div className="border border-hairline p-3 bg-background/30">
            <div className="text-[10px] font-mono text-muted-foreground/70 mb-1 uppercase tracking-widest">
              {c.released}
            </div>
            <div className="text-base font-mono text-laser">$483.33</div>
          </div>
        </div>
      </div>
    </div>
  );
}
