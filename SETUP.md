# CeylonRoute — Backend Setup (Phase 3 & 4)

The public site, online booking, and admin dashboard are all wired to **Supabase**
(Postgres + Auth + Storage) and **Resend** (email). Follow these steps once to go live.

## 1. Environment variables (`.env.local`)

Already present in this project:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
RESEND_FROM=CeylonRoute <onboarding@resend.dev>
```

- `RESEND_FROM` defaults to Resend's shared sender, which only delivers to your own
  Resend account email. To email a real admin inbox, verify a domain in Resend and
  set `RESEND_FROM` to an address on it (e.g. `bookings@yourdomain.com`).
- `.env.local` is gitignored — keep your keys out of commits.

## 2. Create the database schema

In the Supabase dashboard → **SQL Editor**, paste and run the whole of
[`supabase/schema.sql`](supabase/schema.sql). It is safe to re-run. It creates:

- Tables: `settings`, `packages`, `bookings`, `reviews`
- A `booking_ref` trigger (`CR-YYYY-NNNN`) and a `create_booking` RPC
- Row Level Security (public can insert bookings/reviews & read public data;
  only signed-in admins can read bookings or manage content)
- A public Storage bucket `tour-images`
- Seed data: default settings row, 3 tour packages, a few approved reviews

After running it, update `settings.admin_email` to the inbox that should receive
booking alerts (in the SQL, or later in the admin **Settings** page).

## 3. Create an admin user

Supabase dashboard → **Authentication → Users → Add user**. Enter an email +
password. That account can sign in at `/admin/login`. (There is no public sign-up —
admins are created here by you.)

## 4. Run it

```bash
npm run dev
```

- Public site: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin` (redirects to login if signed out)

## How it fits together

- **Public pages** read packages/settings/approved-reviews through cached functions
  (`lib/data/queries.ts`). Admin edits call `revalidateTag`, so changes appear on the
  site immediately.
- **Bookings** post to `POST /api/bookings`, which inserts via the `create_booking`
  RPC (so the customer gets their `booking_ref` back without exposing other bookings),
  then emails the admin via Resend. A failed email never breaks the booking.
- **Admin** pages are client components using the signed-in Supabase session; RLS
  enforces that only authenticated admins can read bookings and manage content.
  `proxy.ts` (Next.js 16's renamed middleware) guards `/admin/**`.

## Notes

- Until the schema is applied, public pages render with safe fallbacks (default
  rates, empty package/review lists) and won't crash.
- No online payments — the model is "Book Now, Pay on Arrival / After Confirmation".
