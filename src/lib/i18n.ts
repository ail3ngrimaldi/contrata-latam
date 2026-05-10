export type Lang = "es" | "en";

type Dict = {
  nav: { protocol: string; arbitration: string; faq: string; cta: string };
  badge: string;
  hero: {
    title1: string; title2: string; subtitle: string;
    emailPlaceholder: string; cta: string; ctaSent: string; microcopy: string;
  };
  contractCard: {
    tag: string; status: string; project: string; milestone: string;
    amount: string; escrowed: string; released: string; ref: string;
  };
  problem: { eyebrow: string; title: string; copy: string };
  how: {
    eyebrow: string; title: string;
    steps: ReadonlyArray<{ n: string; tag: string; title: string; copy: string }>;
  };
  diff: {
    eyebrow: string; title: string;
    items: ReadonlyArray<{ k: string; v: string }>;
  };
  faq: {
    eyebrow: string; title: string;
    items: ReadonlyArray<{ q: string; a: string }>;
  };
  waitlist: {
    eyebrow: string; title: string; copy: string;
    placeholder: string; cta: string; ctaSent: string;
  };
  footer: { tagline: string; links: ReadonlyArray<string>; copy: string };
};

export const translations: Record<Lang, Dict> = {
  es: {
    nav: {
      protocol: "Cómo funciona",
      arbitration: "Protección",
      faq: "Preguntas",
      cta: "Comenzar",
    },
    badge: "Disponible en LATAM · Beta",
    hero: {
      title1: "La forma seria de contratar",
      title2: "y ser contratado.",
      subtitle:
        "Crea un contrato digital, bloquea el pago y entrega el trabajo con confianza. Todo queda registrado. Nada queda al azar.",
      emailPlaceholder: "tu@email.com",
      cta: "Unirme a la lista",
      ctaSent: "✓ Listo, te avisamos",
      microcopy: "Beta privada · Sin tarjeta de crédito",
    },
    contractCard: {
      tag: "Contrato Activo",
      status: "Dinero bloqueado",
      project: "Rediseño de App Móvil",
      milestone: "Entrega 1 de 3",
      amount: "Monto",
      escrowed: "Bloqueado",
      released: "Liberado",
      ref: "REF",
    },
    problem: {
      eyebrow: "El Problema",
      title: "Contratar en internet no debería ser un acto de fe.",
      copy: "Contrataste a alguien y nunca entregó. Entregaste y nunca te pagaron. Con Contrata, el dinero queda bloqueado hasta que ambas partes confirman que todo está bien. Sin sorpresas, sin peleas.",
    },
    how: {
      eyebrow: "Cómo Funciona",
      title: "Tres pasos. Protección completa.",
      steps: [
        {
          n: "01",
          tag: "Acuerdo",
          title: "Acordar",
          copy: "Escribe qué trabajo se va a hacer y cuánto se va a pagar. Ambos confirman que entienden lo mismo.",
        },
        {
          n: "02",
          tag: "Bloqueo",
          title: "Bloquear el dinero",
          copy: "El cliente envía el pago a Contrata. El dinero queda bloqueado hasta que el trabajo esté listo. Nadie puede tocarlo, ni siquiera nosotros.",
        },
        {
          n: "03",
          tag: "Confirmación",
          title: "Confirmar y cobrar",
          copy: "El freelancer muestra su trabajo. El cliente confirma: \"Esto es lo que acordamos.\" El dinero va directo al freelancer. Todo queda registrado.",
        },
      ],
    },
    diff: {
      eyebrow: "Por qué Contrata",
      title: "Construido para la realidad LATAM.",
      items: [
        { k: "Dinero bloqueado", v: "El pago queda seguro desde el día 1, sin intermediarios opacos." },
        { k: "Sin abogados", v: "Si hay desacuerdo, un árbitro neutral revisa y decide en 72 horas." },
        { k: "Todo registrado", v: "Cada acuerdo, entrega y aprobación queda guardada." },
        { k: "Múltiples pagos", v: "Cripto estable, transferencia local o tarjeta — tú eliges." },
        { k: "Sin complicaciones", v: "Interfaz simple. Sin términos técnicos. Tan fácil como enviar un email." },
        { k: "Comisión justa", v: "2.5% sobre el contrato. Solo cobramos si ambos están protegidos." },
      ],
    },
    faq: {
      eyebrow: "Preguntas",
      title: "Lo que necesitas saber.",
      items: [
        {
          q: "¿Cuánto cuesta usar Contrata?",
          a: "2.5% del monto del contrato. Si todo va bien, es automático y mínimo. Solo cobramos cuando el trabajo se confirma.",
        },
        {
          q: "¿Qué pasa si el cliente no aprueba el trabajo?",
          a: "Un árbitro neutral revisa las evidencias (mensajes, archivos, entregables) y decide quién tiene razón. Su decisión es final.",
        },
        {
          q: "¿Necesito saber de criptomonedas?",
          a: "No. La plataforma maneja todo por ti. Solo necesitas tu email. El dinero puede venir de tu tarjeta o cuenta bancaria.",
        },
        {
          q: "¿Cuánto tarda en liberarse el dinero?",
          a: "Si ambos están de acuerdo: inmediato. Si hay disputa: 3 a 7 días, según la complejidad del caso.",
        },
        {
          q: "¿Puedo cancelar un contrato?",
          a: "Sí. El cliente puede cancelar dentro de las primeras 72 horas y recuperar su dinero. Después de ese plazo, el contrato está activo y protege al freelancer.",
        },
      ],
    },
    waitlist: {
      eyebrow: "Acceso Anticipado",
      title: "Sé de los primeros en operar con tranquilidad.",
      copy: "Acceso temprano + soporte directo del equipo. Te avisamos cuando estés listo para entrar.",
      placeholder: "tu@email.com",
      cta: "Reservar mi lugar",
      ctaSent: "✓ Te avisaremos pronto",
    },
    footer: {
      tagline: "Hecho con orgullo en Latinoamérica.",
      links: ["Términos", "Privacidad", "Tarifas"],
      copy: "© 2024 Contrata Labs",
    },
  },
  en: {
    nav: {
      protocol: "How it works",
      arbitration: "Protection",
      faq: "FAQ",
      cta: "Start now",
    },
    badge: "Available in LATAM · Beta",
    hero: {
      title1: "The serious way to hire",
      title2: "and get hired.",
      subtitle:
        "Create a digital contract, lock the payment and deliver with confidence. Everything is recorded. Nothing is left to chance.",
      emailPlaceholder: "you@email.com",
      cta: "Join the list",
      ctaSent: "✓ You're in",
      microcopy: "Private beta · No credit card needed",
    },
    contractCard: {
      tag: "Active Contract",
      status: "Money locked",
      project: "Mobile App Redesign",
      milestone: "Delivery 1 of 3",
      amount: "Amount",
      escrowed: "Locked",
      released: "Released",
      ref: "REF",
    },
    problem: {
      eyebrow: "The Problem",
      title: "Hiring online shouldn't be an act of faith.",
      copy: "You hired someone and they never delivered. You delivered and never got paid. With Contrata, money is locked until both sides confirm everything went well. No surprises, no arguments.",
    },
    how: {
      eyebrow: "How it Works",
      title: "Three steps. Complete protection.",
      steps: [
        {
          n: "01",
          tag: "Agree",
          title: "Agree",
          copy: "Write down what work will be done and how much will be paid. Both sides confirm they understand the same thing.",
        },
        {
          n: "02",
          tag: "Lock",
          title: "Lock the money",
          copy: "Client sends the payment to Contrata. Money is locked until the job is complete. Nobody can touch it — not even us.",
        },
        {
          n: "03",
          tag: "Confirm",
          title: "Confirm & get paid",
          copy: "Freelancer shows their work. Client confirms: \"This is what we agreed on.\" Money goes straight to the freelancer. Everything is recorded.",
        },
      ],
    },
    diff: {
      eyebrow: "Why Contrata",
      title: "Built for the LATAM reality.",
      items: [
        { k: "Money locked", v: "Payment is safe from day 1, no opaque middlemen." },
        { k: "No lawyers", v: "If there's a disagreement, a neutral arbiter reviews and decides within 72 hours." },
        { k: "Everything recorded", v: "Every agreement, delivery and approval is saved." },
        { k: "Multiple payments", v: "Stable crypto, local wire or card — your choice." },
        { k: "No complications", v: "Simple interface. No technical jargon. As easy as sending an email." },
        { k: "Fair pricing", v: "2.5% per contract. We only earn when both sides are protected." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "What you need to know.",
      items: [
        {
          q: "How much does Contrata cost?",
          a: "2.5% of the contract amount. If everything goes well, it's automatic and minimal. We only charge when work is confirmed.",
        },
        {
          q: "What if the client doesn't approve the work?",
          a: "A neutral arbiter reviews all evidence (messages, files, deliverables) and decides who's right. The decision is final.",
        },
        {
          q: "Do I need to know about crypto?",
          a: "No. The platform handles everything for you. You only need your email. Payment can come from your card or bank account.",
        },
        {
          q: "How long until funds are released?",
          a: "If both agree: immediately. If disputed: 3 to 7 days, depending on the complexity of the case.",
        },
        {
          q: "Can I cancel a contract?",
          a: "Yes. The client can cancel within the first 72 hours and recover their money. After that, the contract is active and protects the freelancer.",
        },
      ],
    },
    waitlist: {
      eyebrow: "Early Access",
      title: "Be among the first to operate with confidence.",
      copy: "Early access + direct team support. We'll notify you when you're ready to join.",
      placeholder: "you@email.com",
      cta: "Reserve my spot",
      ctaSent: "✓ We'll be in touch",
    },
    footer: {
      tagline: "Proudly made in Latin America.",
      links: ["Terms", "Privacy", "Pricing"],
      copy: "© 2024 Contrata Labs",
    },
  },
};

export type Translations = Dict;

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "es";
  const stored = typeof localStorage !== "undefined"
    ? (localStorage.getItem("contrata-lang") as Lang | null)
    : null;
  if (stored === "es" || stored === "en") return stored;
  const nav = navigator.language?.toLowerCase() ?? "es";
  return nav.startsWith("en") ? "en" : "es";
}
