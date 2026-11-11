import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { pricingSettings } from "@/data/mockTours";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CeylonRoute — Private Driver-Guided Tours of Sri Lanka",
    template: "%s · CeylonRoute",
  },
  description:
    "Explore Sri Lanka at your own pace in a private A/C vehicle with a dedicated local driver-guide. Transparent per-km pricing, zero hidden charges, fully tailored routes.",
  keywords: [
    "Sri Lanka private tours",
    "Sri Lanka driver guide",
    "Ceylon tour packages",
    "private transport Sri Lanka",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-ink">
        <Navbar whatsappNumber={pricingSettings.whatsappNumber} />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp whatsappNumber={pricingSettings.whatsappNumber} />
      </body>
    </html>
  );
}
