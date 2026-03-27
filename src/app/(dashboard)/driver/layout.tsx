"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Wallet,
  Plus,
  Bell,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/app/driver", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/app/driver/rides", label: "Rides", icon: Car, exact: false },
  { href: "/app/driver/earnings", label: "Earnings", icon: Wallet, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-sidebar min-h-screen sticky top-0 h-screen p-4 gap-2">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <span className="text-sidebar-primary-foreground font-bold text-sm font-heading">K</span>
        </div>
        <span className="text-sidebar-foreground font-bold text-lg font-heading tracking-tight">omute</span>
        <span className="ml-1 text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/30 border border-sidebar-foreground/20 rounded px-1 py-0.5">
          Driver
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Icon size={17} />
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 pt-4 border-t border-sidebar-border">
        <Link
          href="/app/driver/rides/new"
          className="flex items-center justify-center gap-2 bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Post a ride
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/30 hover:text-sidebar-foreground/60 transition-colors rounded-lg"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
      <div className="flex items-center gap-1.5">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs font-heading">K</span>
        </div>
        <span className="text-foreground font-bold text-base font-heading tracking-tight">omute</span>
      </div>
      <button
        className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
        aria-label="Notifications"
      >
        <Bell size={16} />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber border-2 border-background" />
      </button>
    </header>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-primary px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 flex-1 py-1"
          >
            <div
              className={`relative flex items-center justify-center w-10 h-8 rounded-xl transition-colors ${
                active ? "bg-white/10" : ""
              }`}
            >
              <Icon size={20} className={active ? "text-white" : "text-white/30"} />
              {active && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber" />
              )}
            </div>
            <span className={`text-[10px] font-semibold tracking-wide ${active ? "text-white/90" : "text-white/30"}`}>
              {label}
            </span>
          </Link>
        );
      })}

      <Link
        href="/app/driver/rides/new"
        className="flex items-center justify-center mb-1 rounded-2xl bg-amber shadow-lg text-amber-dark transition-transform active:scale-95 hover:opacity-90"
        style={{ width: 52, height: 52 }}
      >
        <Plus size={22} />
      </Link>
    </nav>
  );
}

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar pathname={pathname} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
      </div>
      <BottomNav pathname={pathname} />
    </div>
  );
}
