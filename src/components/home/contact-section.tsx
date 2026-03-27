"use client";

import { useState } from "react";
import { Send, Loader2, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReveal } from "@/hooks/use-reveal";
import Link from "next/link";

export default function ContactSection() {
  const sectionRef = useReveal();
  const [formState, setFormState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("sending");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setFormState("sent");
        form.reset();
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative bg-ink text-[#FAFAF8]"
    >
      {/* Amber glow — same pattern as driver CTA section */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(245,158,11,0.08),_transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* ============================
              LEFT — Headline + direct contacts
              Same pattern as "problem" section left col
              ============================ */}
          <div>
            <p className="reveal-item font-body text-xs font-semibold uppercase tracking-[0.25em] text-[#FAFAF8]/40 opacity-0 translate-y-6 transition-all duration-700">
              Contact
            </p>
            <h2 className="reveal-item mt-6 font-heading text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold leading-[1.05] tracking-tight opacity-0 translate-y-6 transition-all delay-100 duration-700">
              Got something
              <br />
              on your mind?
            </h2>
            <p className="reveal-item mt-5 max-w-sm font-body text-base leading-relaxed text-[#FAFAF8]/50 opacity-0 translate-y-6 transition-all delay-200 duration-700">
              Route questions, partnership ideas, driver onboarding, or
              just telling us about your 5AM bus stop experience. We
              read everything.
            </p>

            {/* Direct contacts — typographic, matching the dark section aesthetic */}
            <div className="reveal-item mt-14 space-y-0 opacity-0 translate-y-6 transition-all delay-300 duration-700">
              <Link
                href="mailto:hello@komute.app"
                className="group flex items-center justify-between border-t border-[#FAFAF8]/10 py-5 transition-colors hover:border-[#FAFAF8]/20"
              >
                <div>
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/30">
                    Email
                  </p>
                  <p className="mt-1 font-heading text-base font-bold transition-colors group-hover:text-amber">
                    hello@komute.app
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#FAFAF8]/20 transition-all group-hover:text-amber group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                href="tel:+2348000000000"
                className="group flex items-center justify-between border-t border-[#FAFAF8]/10 py-5 transition-colors hover:border-[#FAFAF8]/20"
              >
                <div>
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/30">
                    Phone
                  </p>
                  <p className="mt-1 font-heading text-base font-bold transition-colors group-hover:text-amber">
                    +234 800 000 0000
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#FAFAF8]/20 transition-all group-hover:text-amber group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <div className="flex items-center justify-between border-t border-b border-[#FAFAF8]/10 py-5">
                <div>
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/30">
                    Location
                  </p>
                  <p className="mt-1 font-heading text-base font-bold">
                    Lagos, Nigeria
                  </p>
                </div>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
                  <span className="font-body text-xs text-[#FAFAF8]/40">
                    Replies under 2hrs
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* ============================
              RIGHT — Form
              Styled for dark bg, no card wrapper
              ============================ */}
          <div className="reveal-item opacity-0 translate-y-8 transition-all delay-[400ms] duration-700">
            {formState === "sent" ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/10">
                  <CheckCircle2 className="h-7 w-7 text-amber" />
                </div>
                <h3 className="mt-6 font-heading text-xl font-bold">
                  Message sent
                </h3>
                <p className="mt-2 font-body text-sm text-[#FAFAF8]/50">
                  We&apos;ll get back to you shortly. Keep an eye on your
                  inbox.
                </p>
                <button
                  onClick={() => setFormState("idle")}
                  className="mt-8 font-body text-sm text-amber underline decoration-amber/30 underline-offset-4 hover:decoration-amber/60 transition-colors"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Two-col: Name + Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/30"
                    >
                      Name
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="Ada Nwosu"
                      required
                      className="h-12 rounded-lg border-[#FAFAF8]/10 bg-[#FAFAF8]/[0.04] font-body text-[#FAFAF8] placeholder:text-[#FAFAF8]/20 focus-visible:border-amber/40 focus-visible:ring-amber/10"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/30"
                    >
                      Email
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="ada@example.com"
                      required
                      className="h-12 rounded-lg border-[#FAFAF8]/10 bg-[#FAFAF8]/[0.04] font-body text-[#FAFAF8] placeholder:text-[#FAFAF8]/20 focus-visible:border-amber/40 focus-visible:ring-amber/10"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/30"
                  >
                    Subject
                  </label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    placeholder="Partnership, route request, feedback..."
                    required
                    className="h-12 rounded-lg border-[#FAFAF8]/10 bg-[#FAFAF8]/[0.04] font-body text-[#FAFAF8] placeholder:text-[#FAFAF8]/20 focus-visible:border-amber/40 focus-visible:ring-amber/10"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF8]/30"
                  >
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell us what's on your mind..."
                    required
                    rows={5}
                    className="rounded-lg border-[#FAFAF8]/10 bg-[#FAFAF8]/[0.04] font-body text-[#FAFAF8] resize-none placeholder:text-[#FAFAF8]/20 focus-visible:border-amber/40 focus-visible:ring-amber/10"
                  />
                </div>

                {/* Error */}
                {formState === "error" && (
                  <div className="rounded-lg border border-terra/30 bg-terra/10 px-4 py-3">
                    <p className="font-body text-sm text-terra-light">
                      Something went wrong. Try again or email{" "}
                      <Link
                        href="mailto:orisabiyidavid@gmail.com"
                        className="underline underline-offset-2"
                      >
                        hello@komute.app
                      </Link>{" "}
                      directly.
                    </p>
                  </div>
                )}

                {/* Submit — amber CTA matching the landing page pattern */}
                <Button
                  type="submit"
                  disabled={formState === "sending"}
                  className="h-12 w-full bg-amber font-heading text-[15px] font-semibold text-ink hover:bg-amber-dark disabled:opacity-50"
                >
                  {formState === "sending" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}