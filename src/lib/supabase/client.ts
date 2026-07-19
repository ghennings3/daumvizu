import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client para uso em Client Components.
 * Usa a publishable key (chave pública) — nunca use a secret key aqui.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
