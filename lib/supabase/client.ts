import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for Client Components (admin dashboard, booking &
 * review submission). Carries the signed-in session via cookies, so RLS sees
 * `authenticated` for admin operations.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
