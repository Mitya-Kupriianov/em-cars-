import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin-auth";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const OWNER_EMAIL = (process.env.ADMIN_OWNER_EMAIL || "").trim().toLowerCase();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// GET — список членов команды (владелец + редакторы)
export async function GET() {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase не настроен" }, { status: 503 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .select("email, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Владелец из env показывается всегда и не удаляется.
  const members = [
    ...(OWNER_EMAIL ? [{ email: OWNER_EMAIL, role: "owner" as const, created_at: null, isPrimaryOwner: true }] : []),
    ...(data || [])
      .filter((m) => m.email !== OWNER_EMAIL)
      .map((m) => ({ ...m, isPrimaryOwner: false })),
  ];

  return NextResponse.json(members);
}

// POST — добавить участника { email, role }
export async function POST(req: Request) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase не настроен" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const role = body.role === "owner" ? "owner" : "editor";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }
  if (email === OWNER_EMAIL) {
    return NextResponse.json({ error: "Этот email уже владелец" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .upsert({ email, role }, { onConflict: "email" })
    .select("email, role, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ...data, isPrimaryOwner: false }, { status: 201 });
}

// DELETE ?email= — убрать участника
export async function DELETE(req: Request) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase не настроен" }, { status: 503 });
  }

  const email = (new URL(req.url).searchParams.get("email") || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Не указан email" }, { status: 400 });
  }
  if (email === OWNER_EMAIL) {
    return NextResponse.json({ error: "Нельзя удалить главного владельца" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("admin_users").delete().eq("email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
