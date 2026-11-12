import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client bound to the request cookies. Use inside Server
 * Components, Route Handlers and Server Actions that need the signed-in admin
 * session. Reading cookies opts the caller into request-time rendering, so keep
 * it out of `"use cache"` paths.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where cookies are read-only —
            // the proxy refreshes the session instead, so this is safe to ignore.
          }
        },
      },
    },
  );
}
