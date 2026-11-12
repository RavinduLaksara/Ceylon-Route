import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { getSettings } from "@/lib/data/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <Navbar whatsappNumber={settings.whatsappNumber} />
      <div className="flex-1">{children}</div>
      <Footer />
      <FloatingWhatsApp whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
