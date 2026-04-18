export type Lang = "es" | "en";

export const translations = {
  es: {
    nav: {
      protocol: "Protocolo",
      arbitration: "Arbitraje",
      faq: "Preguntas",
      cta: "Acceder a Beta",
    },
    badge: "Nodo LATAM · Beta v0.9",
    hero: {
      title1: "Protege tu dinero antes de",
      title2: "contratar a alguien nuevo.",
      subtitle:
        "Escrow inteligente y arbitraje neutral para freelancers y clientes en LATAM. Sin abogados, sin fricción, sin sorpresas.",
      emailPlaceholder: "tu@email.com",
      cta: "Unirme a la Waitlist",
      ctaSent: "✓ Estás dentro",
      microcopy: "Beta privada · Cupo limitado a 500 nodos",
    },
    contractCard: {
      tag: "Contrato Activo",
      status: "En Escrow",
      project: "Rediseño de App Móvil",
      milestone: "Hito 1 de 3",
      amount: "Monto",
      escrowed: "Depositado",
      released: "Liberado",
      ref: "REF",
    },
    problem: {
      eyebrow: "El Problema",
      title:
        "El 42% de freelancers en LATAM enfrentó impagos el último año.",
      copy: "Contrataste a alguien y nunca entregó. Entregaste y nunca te pagaron. Tuviste una disputa que costó más que el contrato. La desconfianza es el impuesto invisible de la economía digital — y nosotros lo eliminamos.",
    },
    how: {
      eyebrow: "Cómo Funciona",
      title: "Tres pasos. Cero incertidumbre.",
      steps: [
        {
          n: "01",
          tag: "Depósito",
          title: "El cliente deposita en escrow",
          copy: "Los fondos quedan resguardados desde el día uno. Nadie puede tocarlos sin verificación o consenso mutuo.",
        },
        {
          n: "02",
          tag: "Entrega",
          title: "El freelancer entrega por hitos",
          copy: "Cada milestone se valida y libera automáticamente. Conversaciones, archivos y aprobaciones quedan auditados.",
        },
        {
          n: "03",
          tag: "Resolución",
          title: "Arbitraje neutral si hay disputa",
          copy: "Un árbitro experto revisa la evidencia y resuelve en 72 horas. Decisión final, sin abogados, sin drama.",
        },
      ],
    },
    diff: {
      eyebrow: "Por qué Contrata",
      title: "Construido para la realidad LATAM.",
      items: [
        { k: "Escrow automático", v: "Dinero seguro desde el día 1, sin custodios opacos." },
        { k: "Arbitraje transparente", v: "Sin abogados ni cortes. Expertos neutrales revisan evidencia." },
        { k: "Auditoría completa", v: "Toda conversación, archivo y aprobación queda registrada." },
        { k: "Pagos múltiples", v: "Cripto, transferencia local o tarjeta — tú eliges." },
        { k: "Sin fricción", v: "Interfaz simple. Sin jargon. Tan fácil como Stripe." },
        { k: "Comisión justa", v: "2-3% sobre el contrato. Solo cobramos si ambos están protegidos." },
      ],
    },
    faq: {
      eyebrow: "Preguntas",
      title: "Lo que necesitas saber.",
      items: [
        {
          q: "¿Cuánto cuesta?",
          a: "2-3% de comisión sobre el monto del contrato. Si todo va bien, es automático. Si hay disputa, hay un costo extra menor por arbitraje.",
        },
        {
          q: "¿Qué pasa si hay desacuerdo?",
          a: "Un árbitro neutral revisa toda la evidencia (chat, documentos, entregables) y decide quién tiene razón. Su decisión es final y vinculante.",
        },
        {
          q: "¿Es seguro usar cripto?",
          a: "Soportamos múltiples formas de pago — cripto estable (USDC), transferencia local y tarjeta. Todos los métodos están asegurados por escrow.",
        },
        {
          q: "¿Cuánto tarda en liberarse el dinero?",
          a: "Si ambos están de acuerdo: 24-48 horas. Si hay disputa: 5-7 días, según el tiempo del árbitro.",
        },
        {
          q: "¿Necesito wallet o saber de cripto?",
          a: "No. La plataforma maneja todo. Es tan simple como Stripe — solo necesitas tu email y método de pago.",
        },
      ],
    },
    waitlist: {
      eyebrow: "Beta Privada",
      title: "Sé de los primeros en operar con confianza.",
      copy: "Acceso temprano + soporte directo del equipo. Recibirás un link de invitación cuando lancemos.",
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
      protocol: "Protocol",
      arbitration: "Arbitration",
      faq: "FAQ",
      cta: "Beta Access",
    },
    badge: "LATAM Node · Beta v0.9",
    hero: {
      title1: "Protect your money before",
      title2: "hiring someone new.",
      subtitle:
        "Smart escrow and neutral arbitration for freelancers and clients in LATAM. No lawyers, no friction, no surprises.",
      emailPlaceholder: "you@email.com",
      cta: "Join the Waitlist",
      ctaSent: "✓ You're in",
      microcopy: "Private beta · Limited to 500 nodes",
    },
    contractCard: {
      tag: "Active Contract",
      status: "In Escrow",
      project: "Mobile App Redesign",
      milestone: "Milestone 1 of 3",
      amount: "Amount",
      escrowed: "Escrowed",
      released: "Released",
      ref: "REF",
    },
    problem: {
      eyebrow: "The Problem",
      title:
        "42% of LATAM freelancers faced unpaid invoices last year.",
      copy: "You hired someone and they never delivered. You delivered and never got paid. A dispute cost more than the contract itself. Distrust is the invisible tax on the digital economy — and we eliminate it.",
    },
    how: {
      eyebrow: "How it Works",
      title: "Three steps. Zero uncertainty.",
      steps: [
        {
          n: "01",
          tag: "Deposit",
          title: "Client deposits into escrow",
          copy: "Funds are secured from day one. Nobody can touch them without verification or mutual consent.",
        },
        {
          n: "02",
          tag: "Delivery",
          title: "Freelancer delivers by milestone",
          copy: "Each milestone is validated and auto-released. Conversations, files and approvals are audited.",
        },
        {
          n: "03",
          tag: "Resolution",
          title: "Neutral arbitration on dispute",
          copy: "An expert arbiter reviews evidence and decides within 72 hours. Final, binding, no lawyers, no drama.",
        },
      ],
    },
    diff: {
      eyebrow: "Why Contrata",
      title: "Built for the LATAM reality.",
      items: [
        { k: "Automatic escrow", v: "Money safe from day 1, no opaque custodians." },
        { k: "Transparent arbitration", v: "No lawyers, no courts. Neutral experts review evidence." },
        { k: "Full audit trail", v: "Every conversation, file and approval recorded." },
        { k: "Multi-rail payments", v: "Crypto, local wire or card — your choice." },
        { k: "Zero friction", v: "Clean interface. No jargon. As easy as Stripe." },
        { k: "Fair pricing", v: "2-3% per contract. We only earn when both sides are protected." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "What you need to know.",
      items: [
        {
          q: "How much does it cost?",
          a: "2-3% commission on the contract amount. If everything goes smoothly, it's automatic. Disputes carry a small additional arbitration fee.",
        },
        {
          q: "What happens on a disagreement?",
          a: "A neutral arbiter reviews all evidence (chat, documents, deliverables) and decides who's right. The decision is final and binding.",
        },
        {
          q: "Is crypto safe to use?",
          a: "We support multiple payment rails — stable crypto (USDC), local wire and card. All are secured through escrow.",
        },
        {
          q: "How long until funds are released?",
          a: "If both agree: 24-48 hours. If disputed: 5-7 days depending on arbiter availability.",
        },
        {
          q: "Do I need a wallet or crypto knowledge?",
          a: "No. The platform handles everything. As simple as Stripe — just your email and payment method.",
        },
      ],
    },
    waitlist: {
      eyebrow: "Private Beta",
      title: "Be among the first to operate with confidence.",
      copy: "Early access + direct team support. You'll receive an invite link when we launch.",
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
} as const;

export type Translations = (typeof translations)["es"];

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "es";
  const stored = typeof localStorage !== "undefined"
    ? (localStorage.getItem("contrata-lang") as Lang | null)
    : null;
  if (stored === "es" || stored === "en") return stored;
  const nav = navigator.language?.toLowerCase() ?? "es";
  return nav.startsWith("en") ? "en" : "es";
}
