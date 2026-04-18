import { useLang } from "@/lib/lang-context";

export function Problem() {
  const { t } = useLang();
  return (
    <section className="relative border-y border-hairline bg-surface/30">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          <div>
            <div className="font-mono text-laser text-xs tracking-widest uppercase">
              {t.problem.eyebrow}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <h2 className="font-light text-3xl md:text-5xl text-foreground tracking-tight leading-[1.15] text-balance">
              {t.problem.title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[60ch]">
              {t.problem.copy}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
