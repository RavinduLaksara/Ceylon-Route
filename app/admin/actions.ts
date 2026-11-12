"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/data/queries";

type PublicTag = keyof typeof CACHE_TAGS;

/**
 * Revalidate a public cache tag after an admin mutation, so changes made in the
 * dashboard appear on the public site immediately. Verifies an admin session
 * first (revalidation is otherwise a no-op side effect).
 */
export async function revalidatePublic(tag: PublicTag) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  revalidateTag(CACHE_TAGS[tag], "max");
}
