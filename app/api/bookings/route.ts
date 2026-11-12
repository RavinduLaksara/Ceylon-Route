import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createPublicClient } from "@/lib/supabase/public";
import { validateBooking, type BookingPayload } from "@/lib/booking";
import { formatUsd } from "@/lib/pricing";
import { buildWhatsAppLink, normalizePhone, vehicleLabel } from "@/lib/whatsapp";
import type { DbBooking, DbSettings } from "@/lib/supabase/types";

export async function POST(request: Request) {
  let body: Partial<BookingPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const errors = validateBooking(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed.", errors }, { status: 422 });
  }

  const p = body as BookingPayload;
  const supabase = createPublicClient();

  // Insert via SECURITY DEFINER RPC so the customer gets their booking_ref back
  // without exposing SELECT on the bookings table (RLS keeps it admin-only).
  const { data, error } = await supabase.rpc("create_booking", {
    p_package_id: p.packageId,
    p_vehicle_type: p.vehicleType,
    p_estimated_price: p.estimatedPrice,
    p_full_name: p.fullName.trim(),
    p_email: p.email.trim(),
    p_country: p.country.trim(),
    p_passport_no: p.passportNo.trim(),
    p_whatsapp_no: p.whatsappNo.trim(),
    p_pickup_date: p.pickupDate,
    p_return_date: p.returnDate,
    p_pickup_location: p.pickupLocation.trim(),
    p_drop_location: p.dropLocation.trim(),
    p_adults_count: p.adultsCount,
    p_children_count: p.childrenCount,
    p_luggage_count: p.luggageCount,
    p_needs_kids_seat: p.needsKidsSeat,
    p_special_requirements: p.specialRequirements,
  });

  if (error || !data) {
    console.error("Booking insert failed:", error?.message);
    return NextResponse.json(
      { error: "We couldn't save your booking. Please try again." },
      { status: 500 },
    );
  }

  const booking = data as DbBooking;

  // Fire the admin notification email — never let a mail failure break the booking.
  try {
    await sendAdminEmail(supabase, booking, p);
  } catch (e) {
    console.error("Admin email failed (booking still saved):", e);
  }

  return NextResponse.json({
    ok: true,
    bookingRef: booking.booking_ref,
    status: booking.status,
  });
}

async function sendAdminEmail(
  supabase: ReturnType<typeof createPublicClient>,
  booking: DbBooking,
  p: BookingPayload,
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const { data: settingsRow } = await supabase
    .from("settings")
    .select("admin_email")
    .limit(1)
    .maybeSingle();
  const adminEmail = (settingsRow as Pick<DbSettings, "admin_email"> | null)?.admin_email;
  if (!adminEmail) return;

  const clientWa = buildWhatsAppLink({
    whatsappNumber: normalizePhone(p.whatsappNo),
    extraNote: `Regarding your CeylonRoute booking ${booking.booking_ref}.`,
  });

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM || "CeylonRoute <onboarding@resend.dev>",
    to: adminEmail,
    subject: `New booking ${booking.booking_ref} — ${p.fullName}`,
    html: buildEmailHtml(booking, p, clientWa),
  });
}

function buildEmailHtml(booking: DbBooking, p: BookingPayload, clientWa: string): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;white-space:nowrap">${label}</td><td style="padding:6px 12px;color:#0f172a;font-size:14px;font-weight:600">${value}</td></tr>`;

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px">
    <div style="background:#0f4c3a;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;font-size:20px">New Booking Request</h1>
      <p style="margin:6px 0 0;color:#eab308;font-weight:700;font-size:18px">${booking.booking_ref}</p>
    </div>
    <div style="background:#fff;padding:8px 12px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
      <table style="width:100%;border-collapse:collapse">
        ${row("Package", p.packageTitle || "Airport / Point-to-Point transfer")}
        ${row("Vehicle", vehicleLabel(p.vehicleType))}
        ${row("Estimated price", p.estimatedPrice != null ? formatUsd(p.estimatedPrice) : "—")}
        ${row("Status", booking.status)}
        <tr><td colspan="2" style="padding:8px 12px"><hr style="border:0;border-top:1px solid #e2e8f0"></td></tr>
        ${row("Name", p.fullName)}
        ${row("Email", p.email)}
        ${row("Country", p.country)}
        ${row("Passport No", p.passportNo)}
        ${row("WhatsApp", p.whatsappNo)}
        <tr><td colspan="2" style="padding:8px 12px"><hr style="border:0;border-top:1px solid #e2e8f0"></td></tr>
        ${row("Pickup date", p.pickupDate)}
        ${row("Return date", p.returnDate || "—")}
        ${row("Pickup", p.pickupLocation)}
        ${row("Drop", p.dropLocation)}
        ${row("Adults", String(p.adultsCount))}
        ${row("Children", String(p.childrenCount))}
        ${row("Luggage", String(p.luggageCount))}
        ${row("Kids support seat", p.needsKidsSeat ? "YES" : "No")}
        ${p.specialRequirements ? row("Special requirements", p.specialRequirements) : ""}
      </table>
      <div style="padding:16px 12px">
        <a href="${clientWa}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;font-size:14px">Message ${p.fullName} on WhatsApp</a>
      </div>
    </div>
  </div>`;
}
