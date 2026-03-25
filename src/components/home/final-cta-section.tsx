import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

export default function FinalCTASection() {
  const ctaRef = useReveal();

  return (
    <section ref={ctaRef}>
      <div className="mx-auto max-w-7xl px-5 py-32 text-center md:py-40">
        <div className="reveal-item opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="font-heading text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1] tracking-tight">
            Your commute is broken.
          </h2>
          <h2 className="mt-2 font-heading text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1] tracking-tight text-amber-brand">
            Let&apos;s fix it.
          </h2>
        </div>
        <p className="reveal-item mx-auto mt-6 max-w-md font-body text-muted-foreground opacity-0 translate-y-8 transition-all delay-150 duration-700">
          Join thousands of Lagos workers who are taking back their mornings
          and keeping more of their salary.
        </p>
        <div className="reveal-item mt-10 flex flex-col items-center gap-4 opacity-0 translate-y-8 transition-all delay-300 duration-700 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button
              size="lg"
              className="h-14 bg-amber px-10 text-base font-semibold text-ink hover:bg-amber-dark"
            >
              Get started — it&apos;s free
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
