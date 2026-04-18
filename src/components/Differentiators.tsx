import { useLang } from "@/lib/lang-context";

export function Differentiators() {
  const { t } = useLang();
  return (
    <section id="diff" className="relative border-y border-hairline bg-surface/20">
      <div className="absolute inset-0 technical-grid pointer-events-none opacity-40" />
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="mb-16 max-w-2xl">
          <div className="font-mono text-laser text-xs tracking-widest uppercase mb-4">
            {t.diff.eyebrow}
          </div>
          <h2 className="font-light text-3xl md:text-5xl text-foreground tracking-tight leading-[1.1] text-balance">
            {t.diff.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
          {t.diff.items.map((item, i) => (
            <div
              key={item.k}
              className="bg-background p-8 group hover:bg-surface/60 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] text-laser tracking-widest">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="h-px flex-1 bg-hairline group-hover:bg-laser/50 transition-colors" />
              </div>
              <h3 className="text-foreground font-semibold mb-2 tracking-tight">
                {item.k}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.v}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
