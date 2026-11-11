"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const navLinks = [
  { href: "/#fleet", label: "Fleet" },
  { href: "/packages", label: "Tour Packages" },
  { href: "/#trust", label: "Why Us" },
  { href: "/#reviews", label: "Reviews" },
];

export function Navbar({ whatsappNumber }: { whatsappNumber: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waHref = buildWhatsAppLink({ whatsappNumber });

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-ceylon-800/95 shadow-md shadow-black/10 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-ceylon-900">
            <MapPin className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Ceylon<span className="text-gold">Route</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ceylon-900 shadow-sm transition-transform hover:scale-[1.03]"
          >
            Plan My Trip
          </a>
        </div>

        <button
          type="button"
          className="text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ceylon-800/98 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-base font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 rounded-full bg-gold px-5 py-2.5 text-center text-sm font-semibold text-ceylon-900"
            >
              Plan My Trip
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
