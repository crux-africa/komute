import { useReveal } from "@/hooks/use-reveal";

export default function RealitySection() {
  const problemRef = useReveal();

  return (
    <section
      ref={problemRef}
      className="relative bg-ink text-[#FAFAF8]"
    >
      {/* Subtle forest green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest/20 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <p className="reveal-item font-body text-xs font-semibold uppercase tracking-[0.25em] text-[#FAFAF8]/40 opacity-0 translate-y-6 transition-all duration-700">
              The reality
            </p>
            <h2 className="reveal-item mt-6 font-heading text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tight opacity-0 translate-y-6 transition-all delay-100 duration-700">
              Every morning, 20 million Lagosians fight for a seat to work.
            </h2>
          </div>

          <div className="flex flex-col justify-end gap-8">
            {[
              {
                stat: "4:30 AM",
                text: "Average wake-up time for workers in Ikorodu, Mowe, and Ajah who commute to the Island.",
                color: "text-amber",
              },
              {
                stat: "₦3,000+",
                text: "What a single Bolt ride costs from Ajah to VI. That's ₦60,000/month — half of some people's rent.",
                color: "text-terra-light",
              },
              {
                stat: "45 min",
                text: "Average time spent standing in a BRT queue before you even board. Every single morning.",
                color: "text-amber-light",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="reveal-item flex gap-5 opacity-0 translate-y-6 transition-all duration-700"
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                <div className={`shrink-0 font-heading text-2xl font-extrabold ${item.color} md:text-3xl`}>
                  {item.stat}
                </div>
                <p className="font-body text-sm leading-relaxed text-[#FAFAF8]/60 md:text-base">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pull quote — terracotta border accent */}
        <div className="reveal-item mt-20 border-l-2 border-terra pl-6 opacity-0 translate-y-6 transition-all delay-500 duration-700">
          <blockquote className="font-body text-lg italic text-[#FAFAF8]/70 md:text-xl">
            &ldquo;I leave my house at 5AM, stand in line for an hour, get to
            work exhausted, and by month end half my salary is gone on
            transport.&rdquo;
          </blockquote>
          <cite className="mt-3 block font-body text-sm not-italic text-[#FAFAF8]/40">
            — Lagos commuter, Ikorodu to Victoria Island
          </cite>
        </div>
      </div>
    </section>
  );
}
