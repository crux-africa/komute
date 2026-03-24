"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  // Clock,
  MapPin,
  Shield,
  Banknote,
  ChevronRight,
  Users,
  Zap,
  Star,
} from "lucide-react";
import { RouteMarquee } from "@/components/home/route-marquee";
import { useReveal } from "@/hooks/use-reveal";

export default function Page() {
  const heroRef = useReveal();
  const problemRef = useReveal();
  const howRef = useReveal();
  const trustRef = useReveal();
  const ctaRef = useReveal();

  return (
    <main className="relative overflow-x-hidden">
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-primary">K</span>omute
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#routes"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Routes
            </a>
            <a
              href="#drivers"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Drive
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Get started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <header
        ref={heroRef}
        className="relative min-h-[100svh] pt-16"
      >
        {/* Grain overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-50" />

        {/* Geometric accent */}
        <div className="absolute right-[-10%] top-[15%] h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="absolute left-[-5%] bottom-[10%] h-[300px] w-[300px] rounded-full bg-primary/[0.06] blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center px-5 py-20">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="reveal-item translate-y-8 opacity-0 transition-all duration-700">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Now live in Lagos
              </span>
            </div>

            {/* Headline */}
            <h1 className="reveal-item mt-8 translate-y-8 opacity-0 transition-all delay-100 duration-700">
              <span className="block font-heading text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.92] tracking-tight">
                Book your seat
              </span>
              <span className="block font-heading text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.92] tracking-tight">
                tonight.
              </span>
              <span className="mt-2 block font-heading text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.92] tracking-tight text-primary">
                Skip the queue
              </span>
              <span className="block font-heading text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.92] tracking-tight text-primary">
                tomorrow.
              </span>
            </h1>

            {/* Sub */}
            <p className="reveal-item mt-8 max-w-xl translate-y-8 text-lg leading-relaxed text-muted-foreground opacity-0 transition-all delay-200 duration-700 md:text-xl">
              Stop waking up at 4:30AM to stand in BRT queues. Pre-book a seat
              in a car, shuttle, or keke heading your way — at prices that
              won&apos;t wreck your salary.
            </p>

            {/* CTAs */}
            <div className="reveal-item mt-10 flex flex-col gap-4 opacity-0 translate-y-8 transition-all delay-300 duration-700 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-base font-semibold">
                  Find a ride
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base font-semibold"
                >
                  Offer seats &amp; earn
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="reveal-item mt-14 flex gap-10 opacity-0 translate-y-8 transition-all delay-[400ms] duration-700">
              <div>
                <div className="text-2xl font-bold tracking-tight md:text-3xl">
                  50–70%
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  cheaper than Bolt
                </div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold tracking-tight md:text-3xl">
                  0
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  minutes in a queue
                </div>
              </div>
              <div className="h-12 w-px bg-border hidden sm:block" />
              <div className="hidden sm:block">
                <div className="text-2xl font-bold tracking-tight md:text-3xl">
                  5:45AM
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  earliest rides available
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
            <span className="text-[10px] uppercase tracking-[0.2em]">
              Scroll
            </span>
            <div className="h-8 w-px bg-gradient-to-b from-muted-foreground/50 to-transparent" />
          </div>
        </div>
      </header>

      {/* ============================================
          ROUTE MARQUEE
          ============================================ */}
      <section id="routes" className="border-y border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 py-3">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Popular corridors
          </p>
        </div>

        <RouteMarquee />
      </section>

      {/* ============================================
          THE PROBLEM — Hit the nerve
          ============================================ */}
      <section
        ref={problemRef}
        className="relative bg-foreground text-background"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="grid gap-16 md:grid-cols-2 md:gap-20">
            <div>
              <p className="reveal-item text-xs font-semibold uppercase tracking-[0.25em] text-background/40 opacity-0 translate-y-6 transition-all duration-700">
                The reality
              </p>
              <h2 className="reveal-item mt-6 text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tight opacity-0 translate-y-6 transition-all delay-100 duration-700">
                Every morning, 20 million Lagosians fight for a seat to work.
              </h2>
            </div>

            <div className="flex flex-col justify-end gap-8">
              {[
                {
                  stat: "4:30 AM",
                  text: "Average wake-up time for workers in Ikorodu, Mowe, and Ajah who commute to the Island.",
                },
                {
                  stat: "₦3,000+",
                  text: "What a single Bolt ride costs from Ajah to VI. That's ₦60,000/month — half of some people's rent.",
                },
                {
                  stat: "45 min",
                  text: "Average time spent standing in a BRT queue before you even board. Every single morning.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`reveal-item flex gap-5 opacity-0 translate-y-6 transition-all duration-700`}
                  style={{ transitionDelay: `${150 + i * 100}ms` }}
                >
                  <div className="shrink-0 text-2xl font-extrabold text-primary md:text-3xl">
                    {item.stat}
                  </div>
                  <p className="text-sm leading-relaxed text-background/60 md:text-base">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pull quote */}
          <div className="reveal-item mt-20 border-l-2 border-primary pl-6 opacity-0 translate-y-6 transition-all delay-500 duration-700">
            <blockquote className="text-lg italic text-background/70 md:text-xl">
              &ldquo;I leave my house at 5AM, stand in line for an hour, get to
              work exhausted, and by month end half my salary is gone on
              transport.&rdquo;
            </blockquote>
            <cite className="mt-3 block text-sm not-italic text-background/40">
              — Lagos commuter, Ikorodu to Victoria Island
            </cite>
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section id="how" ref={howRef} className="relative">
        <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="text-center">
            <p className="reveal-item text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground opacity-0 translate-y-6 transition-all duration-700">
              How Komute works
            </p>
            <h2 className="reveal-item mt-4 text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-tight opacity-0 translate-y-6 transition-all delay-100 duration-700">
              Three taps. Seat booked. Morning sorted.
            </h2>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: MapPin,
                title: "Set your route",
                desc: "Tell us where you're coming from and where you're going. We'll show you every ride heading your way tomorrow morning.",
                accent: "bg-primary/10 text-primary",
              },
              {
                step: "02",
                icon: Zap,
                title: "Pick your ride",
                desc: "Private car for ₦800. Shuttle for ₦500. Keke for ₦400. See the driver's rating, vehicle type, and exact departure time.",
                accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              },
              {
                step: "03",
                icon: Banknote,
                title: "Pay and go",
                desc: "Pay instantly via card, transfer, or USSD. Your seat is locked. Show up at the pickup point. No queue, no stress.",
                accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`reveal-item group relative rounded-2xl border border-border/50 bg-card p-8 opacity-0 translate-y-8 transition-all duration-700 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5`}
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                {/* Step number — large, faded */}
                <span className="absolute right-6 top-6 text-6xl font-black text-muted/30">
                  {item.step}
                </span>

                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.accent}`}
                >
                  <item.icon className="h-5 w-5" />
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          COST COMPARISON — The money shot
          ============================================ */}
      <section className="border-y border-border/50 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="text-center">
            <h2 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-tight">
              Your salary shouldn&apos;t go to transport.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              See what Lagos commuters save monthly on Komute vs other options.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-3xl">
            {/* Comparison bars */}
            <div className="space-y-6">
              {[
                {
                  label: "Bolt/Uber",
                  amount: "₦120,000",
                  width: "100%",
                  color: "bg-muted-foreground/20",
                },
                {
                  label: "BRT + Keke",
                  amount: "₦45,000",
                  width: "37.5%",
                  color: "bg-muted-foreground/30",
                },
                {
                  label: "Komute",
                  amount: "₦32,000",
                  width: "26.7%",
                  color: "bg-primary",
                  highlight: true,
                },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span
                      className={`text-sm font-medium ${item.highlight
                        ? "text-primary font-bold"
                        : "text-muted-foreground"
                        }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-lg font-bold tabular-nums ${item.highlight ? "text-primary" : ""
                        }`}
                    >
                      {item.amount}
                      <span className="text-xs font-normal text-muted-foreground">
                        /mo
                      </span>
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${item.color}`}
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-3xl font-extrabold text-primary md:text-4xl">
                Save ₦88,000/month
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                vs Bolt. That&apos;s an extra ₦1,056,000 in your pocket every
                year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TRUST & SAFETY
          ============================================ */}
      <section ref={trustRef}>
        <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <p className="reveal-item text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground opacity-0 translate-y-6 transition-all duration-700">
                Safety first
              </p>
              <h2 className="reveal-item mt-4 text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-tight opacity-0 translate-y-6 transition-all delay-100 duration-700">
                Every person on Komute is verified.
              </h2>
              <p className="reveal-item mt-4 text-muted-foreground opacity-0 translate-y-6 transition-all delay-200 duration-700">
                No anonymous riders. No unverified drivers. Every account
                is backed by government-issued identity, verified in real
                time through Interswitch&apos;s KYC infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Shield,
                  title: "NIN verified",
                  desc: "Every user's identity checked against NIMC database",
                },
                {
                  icon: Users,
                  title: "Face matched",
                  desc: "Drivers' selfies matched to their NIN photo",
                },
                {
                  icon: Star,
                  title: "License checked",
                  desc: "Every driver's license verified with FRSC",
                },
                {
                  icon: Banknote,
                  title: "Bank confirmed",
                  desc: "Payout accounts verified via BVN",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`reveal-item rounded-xl border border-border/50 bg-card p-5 opacity-0 translate-y-6 transition-all duration-700`}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-bold">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          DRIVER CTA
          ============================================ */}
      <section
        id="drivers"
        className="relative overflow-hidden bg-foreground text-background"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.58_0.16_230_/_0.15),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-background/40">
                For drivers
              </p>
              <h2 className="mt-4 text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-tight">
                Turn your daily commute into daily income.
              </h2>
              <p className="mt-4 text-background/60">
                You&apos;re already driving to work. Your back seat is empty.
                List your route, fill your seats, and let other commuters share
                the cost of your fuel. It&apos;s not ride-hailing — it&apos;s
                neighbours going the same way.
              </p>
              <Link href="/login" className="mt-8 inline-block">
                <Button
                  size="lg"
                  className="h-14 bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Start earning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "₦15,000+", label: "average weekly earnings" },
                { value: "3 min", label: "to list a ride" },
                { value: "Same day", label: "payout to your bank" },
                { value: "All vehicles", label: "car, shuttle, or keke" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-background/10 bg-background/5 p-5"
                >
                  <div className="text-xl font-extrabold text-primary md:text-2xl">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs text-background/50">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section ref={ctaRef}>
        <div className="mx-auto max-w-7xl px-5 py-32 text-center md:py-40">
          <div className="reveal-item opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1] tracking-tight">
              Your commute is broken.
            </h2>
            <h2 className="mt-2 text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1] tracking-tight text-primary">
              Let&apos;s fix it.
            </h2>
          </div>
          <p className="reveal-item mx-auto mt-6 max-w-md text-muted-foreground opacity-0 translate-y-8 transition-all delay-150 duration-700">
            Join thousands of Lagos workers who are taking back their mornings
            and keeping more of their salary.
          </p>
          <div className="reveal-item mt-10 flex flex-col items-center gap-4 opacity-0 translate-y-8 transition-all delay-300 duration-700 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="h-14 px-10 text-base font-semibold"
              >
                Get started — it&apos;s free
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-primary">K</span>omute
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Book your seat tonight. Skip the queue tomorrow.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60">
                Powered by
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Interswitch
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}