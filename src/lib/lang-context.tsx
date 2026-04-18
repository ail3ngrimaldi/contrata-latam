import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, detectLang, type Lang, type Translations } from "./i18n";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
};

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  // Default to "es" on SSR; client effect will reconcile to user preference.
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const detected = detectLang();
    setLangState(detected);
    document.documentElement.lang = detected;
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("contrata-lang", l);
    }
    document.documentElement.lang = l;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
