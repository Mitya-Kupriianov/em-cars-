import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createSupabaseBrowser() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(supabaseUrl, serviceKey);
}

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20;
}
