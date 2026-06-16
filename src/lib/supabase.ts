// Серверный модуль. `server-only` гарантирует ошибку сборки, если этот файл
// (а значит и createSupabaseAdmin с service-role ключом) попадёт в клиентский
// бандл. Все текущие потребители — серверные (route-хендлеры и server-либы).
import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Клиент с публичным anon-ключом. Несмотря на имя, используется на сервере
// (в route-хендлерах) для операций под RLS как аноним. Для доступа к Supabase
// из клиентских компонентов заведите отдельный модуль без `server-only`.
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
