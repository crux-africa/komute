import { useReveal } from "@/hooks/use-reveal";
import { Banknote, MapPin, Zap } from "lucide-react";

export default function HowItWorks() {
  const howRef = useReveal();

  return (
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
  )
}