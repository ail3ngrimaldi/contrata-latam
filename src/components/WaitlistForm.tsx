import { useState } from "react";
import { useLang } from "@/lib/lang-context";

export function WaitlistForm({ variant = "default" }: { variant?: "default" | "large" }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Persist locally for now — wire to backend later.
    try {
      const list = JSON.parse(localStorage.getItem("contrata-waitlist") ?? "[]");
      list.push({ email, ts: Date.now() });
      localStorage.setItem("contrata-waitlist", JSON.stringify(list));
    } catch {
      /* noop */
    }
    setSent(true);
  };

  if (variant === "large") {
    return (
      <form onSubmit={onSubmit} className="w-full max-w-xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-0 border border-hairline p-1 bg-surface/60 backdrop-blur-xl rounded-md focus-within:border-laser/50 transition-colors">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.waitlist.placeholder}
            className="flex-1 bg-transparent px-4 py-3.5 text-sm font-mono focus:outline-none placeholder:text-muted-foreground/50"
          />
          <button
            type="submit"
            disabled={sent}
            className="bg-foreground text-background px-6 py-3.5 text-xs font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors rounded-sm disabled:bg-laser disabled:text-background"
          >
            {sent ? t.waitlist.ctaSent : t.waitlist.cta}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md border border-hairline p-1 bg-surface/40 backdrop-blur-xl focus-within:border-laser/50 transition-colors">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.hero.emailPlaceholder}
        className="flex-1 bg-transparent px-4 py-3 text-sm font-mono focus:outline-none placeholder:text-muted-foreground/50"
      />
      <button
        type="submit"
        disabled={sent}
        className="bg-foreground text-background px-6 py-3 text-xs font-mono font-semibold uppercase tracking-widest hover:bg-laser hover:text-background transition-colors disabled:bg-laser disabled:text-background"
      >
        {sent ? t.hero.ctaSent : t.hero.cta}
      </button>
    </form>
  );
}
