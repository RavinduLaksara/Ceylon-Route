"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarCheck,
  Package as PackageIcon,
  Settings as SettingsIcon,
  Star,
  LogOut,
  Menu,
  X,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/packages", label: "Packages", icon: PackageIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // The login page renders without the dashboard chrome.
  if (pathname === "/admin/login") return <>{children}</>;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2 text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-ceylon-900">
          <MapPin className="h-4 w-4" />
        </span>
        <span className="font-bold">
          Ceylon<span className="text-gold">Route</span>
        </span>
      </Link>
      {nav.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={signOut}
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-ceylon-900 lg:block">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-ceylon-900 p-4 text-white lg:hidden">
        <span className="font-bold">
          Ceylon<span className="text-gold">Route</span> Admin
        </span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink/50" />
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-ceylon-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 text-white/70"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
