import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { HowItWorks } from "@/components/HowItWorks";
import { Differentiators } from "@/components/Differentiators";
import { FAQ } from "@/components/FAQ";
import { WaitlistCTA } from "@/components/WaitlistCTA";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <Differentiators />
      <FAQ />
      <WaitlistCTA />
      <Footer />
    </main>
  );
}
