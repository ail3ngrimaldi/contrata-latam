import { useState } from "react";
import { useLang } from "@/lib/lang-context";

export function FAQ() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative">
      <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
        <div className="mb-16">
          <div className="font-mono text-laser text-xs tracking-widest uppercase mb-4">
            {t.faq.eyebrow}
          </div>
          <h2 className="font-light text-3xl md:text-5xl text-foreground tracking-tight leading-[1.1] text-balance">
            {t.faq.title}
          </h2>
        </div>

        <div className="border-t border-hairline">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-hairline">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-foreground text-base md:text-lg font-medium tracking-tight group-hover:text-laser transition-colors">
                    {item.q}
                  </span>
                  <span
                    className={`font-mono text-laser text-xl transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-muted-foreground leading-relaxed max-w-[70ch]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
