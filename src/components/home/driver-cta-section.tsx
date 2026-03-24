import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function DriverCTASection() {
  return (
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
  )
}