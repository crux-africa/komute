"use client";

import { RouteMarquee } from "@/components/home/route-marquee";
import Navbar from "@/components/home/navbar";
import Header from "@/components/home/header";
import RealitySection from "@/components/home/reality-section";
import HowItWorks from "@/components/home/howitworks";
import CostComparison from "@/components/home/cost-section";
import TrustSection from "@/components/home/trust-section";
import DriverCTASection from "@/components/home/driver-cta-section";
import ContactSection from "@/components/home/contact-section";
import FinalCTASection from "@/components/home/final-cta-section";
import Footer from "@/components/home/footer";

export default function Page() {
  return (
    <main className="relative overflow-x-hidden">
      <Navbar />
      <Header />

      <section id="routes" className="border-y border-border/50 bg-secondary/30">
        <RouteMarquee />
      </section>

      <RealitySection />
      <HowItWorks />
      <CostComparison />
      <TrustSection />
      <DriverCTASection />
      <ContactSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}