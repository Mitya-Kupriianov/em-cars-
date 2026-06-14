import { NextResponse } from "next/server";
import { requireAdmin, requireOwner, getAdminUser } from "@/lib/admin-auth";
import { createSupabaseAdmin, createSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(req.url);
  // Админ-режим (все баннеры, включая неактивные) — только для авторизованных.
  const admin = searchParams.get("admin") === "1" ? !!(await getAdminUser()) : false;

  const supabase = admin ? createSupabaseAdmin() : createSupabaseBrowser();

  if (admin) {
    // Admin: return all banners (excluding default, which is fetched separately)
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .gte("sort_order", 0)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("Banners fetch error:", error);
      return NextResponse.json([]);
    }
    return NextResponse.json(data || []);
  }

  // Public: return active banners (excluding default)
  const { data: activeBanners, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .gte("sort_order", 0)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Banners fetch error:", error);
    return NextResponse.json([]);
  }

  // If no active banners, try to return the default one
  if (!activeBanners || activeBanners.length === 0) {
    const { data: defaultBanner } = await supabase
      .from("banners")
      .select("*")
      .eq("sort_order", -1)
      .eq("is_active", true)
      .single();
    return NextResponse.json(defaultBanner ? [defaultBanner] : []);
  }

  return NextResponse.json(activeBanners);
}

export async function POST(req: Request) {
  const gate = await requireAdmin("editBanners");
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const supabase = createSupabaseAdmin();

  if (body.id) {
    const { id, created_at, ...updates } = body;
    const { data, error } = await supabase
      .from("banners")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("banners")
    .insert(body)
    .select()
    .single();

  if (error) {
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
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("banners").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
