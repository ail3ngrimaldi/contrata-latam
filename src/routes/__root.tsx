import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { LangProvider } from "@/lib/lang-context";
import { initFontLoader } from "@/lib/font-loader";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-light text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-laser px-4 py-2 text-sm font-mono uppercase tracking-widest text-background transition-colors hover:opacity-90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Contrata — Protege tus pagos en contratos freelance" },
      {
        name: "description",
        content:
          "Escrow inteligente y arbitraje neutral para freelancers y clientes en LATAM. Protege tu dinero antes de contratar a alguien nuevo.",
      },
      { name: "author", content: "Contrata" },
      { property: "og:title", content: "Contrata — Escrow + Arbitraje para freelancers LATAM" },
      {
        property: "og:description",
        content:
          "Protege tu dinero antes de contratar a alguien nuevo. Escrow inteligente y arbitraje neutral.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1A1A1A" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    initFontLoader();
  }, []);
  return (
    <LangProvider>
      <Outlet />
    </LangProvider>
  );
}
