import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(null);
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("sort_order", -1)
    .single();

  if (error || !data) {
    return NextResponse.json(null);
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const gate = await requireAdmin("editBanners");
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const supabase = createSupabaseAdmin();

  // Check if default banner already exists
  const { data: existing } = await supabase
    .from("banners")
    .select("id")
    .eq("sort_order", -1)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("banners")
      .update({ ...body, sort_order: -1 })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  // Create new
  const { data, error } = await supabase
    .from("banners")
    .insert({ ...body, sort_order: -1 })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
