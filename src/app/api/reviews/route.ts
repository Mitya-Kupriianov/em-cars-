import { NextResponse } from "next/server";
import { requireOwner, getAdminUser } from "@/lib/admin-auth";
import { createSupabaseAdmin, createSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(req.url);
  // Админ-режим (все отзывы, включая скрытые) — только для авторизованных.
  const admin = searchParams.get("admin") === "1" ? !!(await getAdminUser()) : false;
  const supabase = admin ? createSupabaseAdmin() : createSupabaseBrowser();

  let query = supabase.from("reviews").select("*").order("sort_order", { ascending: true });
  if (!admin) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json([]);
  }
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const supabase = createSupabaseAdmin();

  // strip fields not in schema
  const { id, created_at, ...fields } = body;

  if (id) {
    const { data, error } = await supabase
      .from("reviews")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Reviews update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  const { data, error } = await supabase.from("reviews").insert(fields).select().single();
  if (error) {
    console.error("Reviews insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: Request) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) {
    console.error("Reviews delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
