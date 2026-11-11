import {
  Receipt,
  ShieldCheck,
  LifeBuoy,
  CalendarClock,
  Route,
  HandHeart,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const pillars = [
  {
    icon: Receipt,
    title: "Transparent per-km rates",
    body: "Fuel, driver allowance and tolls are always included. The price we quote is the price you pay — zero hidden charges.",
  },
  {
    icon: ShieldCheck,
    title: "Verified local drivers",
    body: "Government-certified, English-speaking chauffeur-guides who know every backroad, viewpoint and hidden gem.",
  },
  {
    icon: LifeBuoy,
    title: "24/7 roadside assistance",
    body: "Round-the-clock support throughout your journey, so you can relax knowing help is always a call away.",
  },
  {
    icon: CalendarClock,
    title: "Flexible cancellation",
    body: "Plans change. Reschedule or cancel with easy, traveller-friendly terms and no stressful fine print.",
  },
  {
    icon: Route,
    title: "100% tailored routes",
    body: "Start late, linger longer, add a detour — your itinerary bends around you, arranged in minutes over WhatsApp.",
  },
  {
    icon: HandHeart,
    title: "Authentic hospitality",
    body: "Travel with a local who treats you like family — honest advice, warm company and real Sri Lankan warmth.",
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="scroll-mt-20 bg-ceylon-900 py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why CeylonRoute"
          title="Built on trust, transparency & local care"
          description="We designed every part of the journey to earn your confidence — from the first WhatsApp message to the final airport drop-off."
          className="[&_h2]:text-white [&_p]:text-white/70"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal
              key={pillar.title}
              delay={i * 70}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:border-gold/40 hover:bg-white/[0.08]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <pillar.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{pillar.body}</p>
            </Reveal>
          ))}
        </div>

        {/* Transparent pricing breakdown */}
        <Reveal className="mt-12 overflow-hidden rounded-2xl bg-gold/10 ring-1 ring-gold/25">
          <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <div>
              <h3 className="text-xl font-bold text-white">Every quote, fully itemised</h3>
              <p className="mt-2 text-sm text-white/70">
                We break down exactly what you pay for. No surprises at pick-up, no padded extras.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {["Fuel", "Driver allowance", "Tolls & parking"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-gold"
                >
                  + {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
