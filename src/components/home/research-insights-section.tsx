export default function ResearchInsightsSection() {
  return (
    <section className="border-y border-border/50 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
        <div className="text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Research insights
          </p>
          <h2 className="mt-4 font-heading text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-tight">
            We asked. 20 commuters answered.
          </h2>
          <p className="mx-auto mt-3 max-w-lg font-body text-muted-foreground">
            In 24 hours. Here&apos;s what they told us about their daily
            commute.
          </p>
        </div>

        {/* Stat bars */}
        <div className="mx-auto mt-16 max-w-2xl space-y-8">
          {[
            { label: "High transport cost", pct: 70, color: "bg-amber" },
            {
              label: "Unpredictable arrival time",
              pct: 65,
              color: "bg-amber-dark",
            },
            {
              label: "Long bus stop queues",
              pct: 40,
              color: "bg-forest dark:bg-forest-light",
            },
            { label: "Safety concerns", pct: 35, color: "bg-terra" },
            { label: "Overcrowding", pct: 25, color: "bg-terra-light" },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-body text-sm font-medium">
                  {item.label}
                </span>
                <span className="font-heading text-sm font-bold">
                  {item.pct}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Key numbers grid */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/50 bg-border/50 sm:grid-cols-4">
          {[
            { value: "85%", sub: "would switch to Komute" },
            { value: "75%", sub: "need verified identity" },
            { value: "70%", sub: "spend ₦1k–₦2.5k daily" },
            { value: "65%", sub: "want co-rider visibility" },
          ].map((item) => (
            <div key={item.sub} className="bg-card p-6 text-center">
              <p className="font-heading text-2xl font-extrabold text-forest dark:text-forest-light md:text-3xl">
                {item.value}
              </p>
              <p className="mt-1 font-body text-[11px] leading-tight text-muted-foreground">
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
