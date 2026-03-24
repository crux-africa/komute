export default function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">K</span>omute
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              Book your seat tonight. Skip the queue tomorrow.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60">
              Powered by
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Interswitch
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}