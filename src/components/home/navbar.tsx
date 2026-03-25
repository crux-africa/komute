import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="font-heading text-xl font-bold tracking-tight">
          <span className="text-forest dark:text-forest-light">K</span>omute
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#how"
            className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="#routes"
            className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Routes
          </Link>
          <Link
            href="#drivers"
            className="font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Drive
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-body">
              Log in
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="font-body">
              Get started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}