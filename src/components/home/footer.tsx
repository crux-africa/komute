import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-forest-light/30 bg-forest text-[#FAFAF8]">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <figure className="flex flex-col items-center md:items-start gap-3">
            <Image
              src="/images/komute-image/komute-logo/komute-logo-trans-dark.png"
              alt="Komute"
              width={1200}
              height={1200}
              className="w-52 h-auto inline-block"
            />
          </figure>

          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8 font-body text-sm text-[#FAFAF8]/60">
              <Link href="#" className="hover:text-[#FAFAF8] transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-[#FAFAF8] transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-[#FAFAF8] transition-colors">
                Support
              </Link>
              <Link href="/login" className="text-amber hover:text-amber-dark transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-forest-light/20 pt-8 md:flex-row">
          <p className="font-body text-xs text-[#FAFAF8]/40">
            © {new Date().getFullYear()} Komute. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="font-body text-[10px] text-[#FAFAF8]/30">
              Payments powered by
            </span>
            <span className="font-body text-xs font-semibold text-[#FAFAF8]/50">
              Paystack & Interswitch
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}