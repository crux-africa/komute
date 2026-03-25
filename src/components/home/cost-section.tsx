export default function CostComparison() {
  return (
    <section className="border-y border-border/50 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-5 py-24 md:py-32">
        <div className="text-center">
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-tight">
            Your salary shouldn&apos;t go to transport.
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-muted-foreground">
            See what Lagos commuters save monthly on Komute vs other options.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
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
                color: "bg-forest dark:bg-forest-light",
                highlight: true,
              },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span
                    className={`font-body text-sm font-medium ${item.highlight
                      ? "text-forest font-bold dark:text-forest-light"
                      : "text-muted-foreground"
                      }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`font-heading text-lg font-bold tabular-nums ${item.highlight ? "text-forest dark:text-forest-light" : ""
                      }`}
                  >
                    {item.amount}
                    <span className="font-body text-xs font-normal text-muted-foreground">
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

          {/* Savings callout — amber energy */}
          <div className="mt-10 rounded-xl border-2 border-amber/30 bg-amber/5 p-6 text-center">
            <p className="font-heading text-3xl font-extrabold text-amber-dark dark:text-amber md:text-4xl">
              Save ₦88,000/month
            </p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              vs Bolt. That&apos;s an extra ₦1,056,000 in your pocket every
              year.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
