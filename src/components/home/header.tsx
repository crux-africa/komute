import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

export default function Header() {
  const heroRef = useReveal();

  return (
    <header ref={heroRef} className="relative min-h-[100svh] pt-16">
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
            Stop waking up at 4:30AM to stand in BRT queues. Pre-book a seat in
            a car, shuttle, or keke heading your way — at prices that won&apos;t
            wreck your salary.
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
                className="h-14 px-8 text-base font-semibold">
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
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-muted-foreground/50 to-transparent" />
        </div>
      </div>
    </header>
  );
}
