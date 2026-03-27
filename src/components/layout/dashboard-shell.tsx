"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search, Car, TicketCheck, PiggyBank, Plus,
  LayoutDashboard, Wallet, User, LogOut, Menu,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ("RIDER" | "DRIVER")[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Find rides", href: "/rider", icon: Search, roles: ["RIDER"] },
  { label: "My bookings", href: "/rider/bookings", icon: TicketCheck, roles: ["RIDER"] },
  { label: "Savings", href: "/rider/savings", icon: PiggyBank, roles: ["RIDER"] },
  { label: "Dashboard", href: "/driver", icon: LayoutDashboard, roles: ["DRIVER"] },
  { label: "My rides", href: "/driver/rides", icon: Car, roles: ["DRIVER"] },
  { label: "Create ride", href: "/driver/rides/new", icon: Plus, roles: ["DRIVER"] },
  { label: "Earnings", href: "/driver/earnings", icon: Wallet, roles: ["DRIVER"] },
  { label: "Profile", href: "/profile", icon: User, roles: ["RIDER", "DRIVER"] },
];

function SidebarContent({
  user,
  collapsed,
  onToggle,
}: {
  user: { name?: string | null; roles: string[]; phone: string };
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const activeRole = pathname.startsWith("/driver") ? "DRIVER" : "RIDER";
  const items = NAV_ITEMS.filter((i) => i.roles.includes(activeRole as "RIDER" | "DRIVER"));
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.phone.slice(-2);

  return (
    <div className="flex h-full flex-col bg-forest">
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/" className="font-heading text-lg font-bold text-[#FAFAF8]">
            <Image
              src="/images/komute-image/komute-logo/komute-logo-trans.png"
              alt="Komute"
              width={1200}
              height={1200}
              className="w-28 h-auto"
            />
          </Link>
        )}
        <Button onClick={onToggle} className="flex h-8 w-8 items-center justify-center rounded-md text-[#FAFAF8]/60 hover:bg-forest-light/30 hover:text-[#FAFAF8] transition-colors">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {user.roles.length > 1 && !collapsed && (
        <div className="mx-3 mb-2 flex rounded-lg bg-forest-light/30 p-1">
          <Link href="/rider" className={cn("flex-1 rounded-md px-3 py-1.5 text-center font-body text-xs font-medium transition-all", activeRole === "RIDER" ? "bg-amber text-ink shadow-sm" : "text-[#FAFAF8]/60 hover:text-[#FAFAF8]")}>Rider</Link>
          <Link href="/driver" className={cn("flex-1 rounded-md px-3 py-1.5 text-center font-body text-xs font-medium transition-all", activeRole === "DRIVER" ? "bg-amber text-ink shadow-sm" : "text-[#FAFAF8]/60 hover:text-[#FAFAF8]")}>Driver</Link>
        </div>
      )}

      <Separator className="bg-forest-light/20" />

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-all", isActive ? "bg-forest-light/40 text-amber font-medium" : "text-[#FAFAF8]/60 hover:bg-forest-light/20 hover:text-[#FAFAF8]")} title={collapsed ? item.label : undefined}>
                  <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-amber")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator className="bg-forest-light/20" />

      <div className="p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-9 w-9 border border-forest-light/30">
            <AvatarFallback className="bg-forest-light text-xs font-bold text-[#FAFAF8]">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-body text-sm font-medium text-[#FAFAF8]">{user.name || "Commuter"}</p>
                <p className="truncate font-body text-xs text-[#FAFAF8]/40">{user.phone}</p>
              </div>
              <Button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/login")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#FAFAF8]/40 hover:bg-forest-light/30 hover:text-[#FAFAF8] transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const activeRole = pathname.startsWith("/driver") ? "DRIVER" : "RIDER";
  const items = NAV_ITEMS.filter((i) => i.roles.includes(activeRole as "RIDER" | "DRIVER") && i.href !== "/profile").slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors", isActive ? "text-forest dark:text-forest-light" : "text-muted-foreground")}>
              <item.icon className={cn("h-5 w-5", isActive && "text-amber")} />
              <span className="font-body text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function DashboardShell({ children, user }: { children: React.ReactNode; user: { name?: string | null; roles: string[]; phone: string } }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const getTitle = () => {
    const map: Record<string, string> = {
      "/rider": "Find rides", "/rider/search": "Search rides", "/rider/bookings": "My bookings", "/rider/savings": "Savings tracker",
      "/driver": "Dashboard", "/driver/rides": "My rides", "/driver/rides/new": "Offer a ride", "/driver/earnings": "Earnings",
      "/profile": "Profile",
    };
    return map[pathname] || "Komute";
  };

  return (
    <div className="flex min-h-svh">
      <aside className={cn("hidden md:block fixed left-0 top-0 z-40 h-svh transition-all duration-300", collapsed ? "w-[68px]" : "w-[260px]")}>
        <SidebarContent user={user} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r-0">
          <SidebarContent user={user} collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("flex-1 transition-all duration-300", collapsed ? "md:ml-[68px]" : "md:ml-[260px]")}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-lg md:px-6">
          <Button onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
          <div className="md:hidden">
            <Image
              src="/images/komute-image/komute-logo/komute-logo-trans.png"
              alt="Komute"
              width={1200}
              height={1200}
              className="w-28 h-auto"
            />
          </div>
          <h1 className="hidden md:block font-heading text-lg font-bold tracking-tight">{getTitle()}</h1>
          <div className="ml-auto">
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer border border-border">
                <AvatarFallback className="bg-forest/10 font-body text-xs font-bold text-forest dark:bg-forest-light/10 dark:text-forest-light">
                  {user.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>
        <main className="p-4 pb-24 md:p-6 md:pb-6">{children}</main>
      </div>

      <MobileBottomNav />
    </div>
  );
}