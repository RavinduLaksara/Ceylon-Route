import { createClient } from "@supabase/supabase-js";

/**
 * Cookieless anonymous client for public reads (packages, settings, approved
 * reviews). Because it never touches cookies, its results can be wrapped in
 * `"use cache"` and prerendered. Do NOT use it for anything that depends on the
 * signed-in admin — use the browser/server clients for that.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
