import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-forest text-[#FAFAF8]">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <span className="font-heading text-lg font-bold tracking-tight">
              <span className="text-amber">K</span>omute
            </span>
            <p className="mt-1 font-body text-xs text-[#FAFAF8]/50">
              Book your seat tonight. Skip the queue tomorrow.
            </p>
          </div>
          <div className="flex items-center gap-6 font-body text-xs text-[#FAFAF8]/50">
            <Link href="#" className="hover:text-[#FAFAF8] transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-[#FAFAF8] transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-[#FAFAF8] transition-colors">
              Support
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body text-[10px] text-[#FAFAF8]/30">
              Powered by
            </span>
            <span className="font-body text-xs font-semibold text-[#FAFAF8]/50">
              Interswitch
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}