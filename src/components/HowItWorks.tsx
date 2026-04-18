import { useLang } from "@/lib/lang-context";

export function HowItWorks() {
  const { t } = useLang();
  return (
    <section id="how" className="relative">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="mb-16 max-w-2xl">
          <div className="font-mono text-laser text-xs tracking-widest uppercase mb-4">
            {t.how.eyebrow}
          </div>
          <h2 className="font-light text-3xl md:text-5xl text-foreground tracking-tight leading-[1.1] text-balance">
            {t.how.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 border-t border-l border-hairline">
          {t.how.steps.map((s) => (
            <div
              key={s.n}
              className="p-8 md:p-10 border-r border-b border-hairline group hover:bg-surface/40 transition-colors"
            >
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-mono text-laser text-3xl font-light">
                  {s.n}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  // {s.tag}
                </span>
              </div>
              <h3 className="text-foreground text-xl font-semibold mb-4 tracking-tight">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
