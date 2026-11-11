"use client";

import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Persistent floating WhatsApp action badge (bottom-right on every page).
 */
export function FloatingWhatsApp({ whatsappNumber }: { whatsappNumber: string }) {
  const href = buildWhatsAppLink({
    whatsappNumber,
    extraNote: "I found you via the CeylonRoute website.",
  });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with CeylonRoute on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-black/20 ring-1 ring-black/5 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:bottom-7 sm:right-7"
      style={{ animation: "var(--animate-float)" }}
    >
      <WhatsAppGlyph className="h-6 w-6 shrink-0" />
      <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
    </a>
  );
}

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.117.555 4.184 1.609 6.004L4 29l8.164-1.57a11.94 11.94 0 0 0 3.84.629h.004C22.625 28.059 28 22.676 28 16.055 28 9.434 22.625 3 16.004 3zm0 21.86h-.004a9.9 9.9 0 0 1-3.49-.633l-.25-.098-4.844.93.92-4.723-.164-.265a9.84 9.84 0 0 1-1.52-5.27c0-5.465 4.45-9.914 9.918-9.914 2.649 0 5.137 1.031 7.012 2.906a9.84 9.84 0 0 1 2.902 7.012c0 5.465-4.449 9.914-9.914 9.914zm5.441-7.426c-.297-.148-1.758-.867-2.031-.965-.273-.098-.473-.148-.672.149-.199.296-.77.964-.945 1.164-.172.199-.348.223-.645.074-.297-.148-1.254-.462-2.39-1.473-.883-.785-1.48-1.758-1.652-2.055-.172-.296-.02-.457.13-.605.134-.133.297-.348.445-.52.149-.173.199-.297.297-.496.098-.199.05-.372-.024-.52-.074-.148-.672-1.62-.922-2.219-.242-.582-.488-.504-.672-.512l-.574-.012c-.199 0-.52.074-.793.372-.273.296-1.04 1.016-1.04 2.476 0 1.461 1.065 2.871 1.213 3.07.149.199 2.096 3.2 5.08 4.487.71.306 1.263.489 1.695.625.713.227 1.361.195 1.874.118.572-.085 1.758-.719 2.006-1.414.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    </svg>
  );
}
