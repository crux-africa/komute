import { useReveal } from "@/hooks/use-reveal";
import { Banknote, Shield, Star, Users } from "lucide-react";

export default function TrustSection() {
  const trustRef = useReveal();

  return (
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
              No anonymous riders. No unverified drivers. Every account is
              backed by government-issued identity, verified in real time
              through Interswitch&apos;s KYC infrastructure.
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
                style={{ transitionDelay: `${200 + i * 100}ms` }}>
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
  );
}
