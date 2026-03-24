"use client";

import { RouteMarquee } from "@/components/home/route-marquee";
import Navbar from "@/components/home/navbar";
import Header from "@/components/home/header";
import RealitySection from "@/components/home/reality-section";
import HowItWorks from "@/components/home/howitworks";
import CostComparison from "@/components/home/cost-section";
import TrustSection from "@/components/home/trust-section";
import DriverCTASection from "@/components/home/driver-cta-section";
import FinalCTASection from "@/components/home/final-cta-section";
import Footer from "@/components/home/footer";

export default function Page() {
  return (
    <main className="relative overflow-x-hidden">
      <Navbar />

      <Header />

      <section id="routes" className="border-y border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 py-3">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Popular corridors
          </p>
        </div>

        <RouteMarquee />
      </section>

      <RealitySection />

      <HowItWorks />

      <CostComparison />

      <TrustSection />

      <DriverCTASection />

      <FinalCTASection />

      <Footer />
    </main>
  );
}