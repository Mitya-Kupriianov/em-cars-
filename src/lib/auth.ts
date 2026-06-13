import { createSupabaseBrowser, isSupabaseConfigured } from "./supabase";

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    if (email === "admin@electro-motors.top" && password === "admin123") {
      return { user: { id: "local-admin", email }, error: null };
    }
    return { user: null, error: { message: "Invalid credentials" } };
  }

  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user || null, error };
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("em-admin-auth");
    }
    return;
  }

  const supabase = createSupabaseBrowser();
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("em-admin-auth");
      if (stored) return { user: JSON.parse(stored) };
    }
    return { user: null };
  }

  const supabase = createSupabaseBrowser();
  const { data } = await supabase.auth.getSession();
  return { user: data?.session?.user || null };
}

export async function isAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("em-admin-auth");
    }
    return false;
  }

  const supabase = createSupabaseBrowser();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", session.user.id)
    .single();

  return !!data;
}
