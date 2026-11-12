"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, AlertCircle, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/admin/bookings");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ceylon-900 p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-ceylon-900">
            <MapPin className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">
            Ceylon<span className="text-gold">Route</span>
          </span>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-7 shadow-2xl"
        >
          <div className="flex items-center gap-2 text-ceylon-800">
            <Lock className="h-5 w-5" />
            <h1 className="text-lg font-bold">Admin sign in</h1>
          </div>
          <p className="mt-1 text-sm text-ink/55">Manage bookings, packages and more.</p>

          <label className="mt-6 block">
            <span className="mb-1 block text-xs font-medium text-ink/60">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoComplete="email"
            />
          </label>
          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-medium text-ink/60">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ceylon-800 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/50">
          Admin accounts are created in your Supabase project (Authentication → Users).
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ceylon-600 focus:ring-2 focus:ring-ceylon-600/20";
