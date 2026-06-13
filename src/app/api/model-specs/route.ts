import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireOwner } from "@/lib/admin-auth";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json([]);
  }

  const supabase = createSupabaseAdmin();
  const brand = req.nextUrl.searchParams.get("brand");
  const model = req.nextUrl.searchParams.get("model");

  let query = supabase.from("model_specs").select("*").order("brand").order("model");

  if (brand) query = query.eq("brand", brand);
  if (model) query = query.eq("model", model);

  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01") return NextResponse.json([]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin("editContent");
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { id, brand, model, spec_sheet } = body;

  if (!brand?.trim() || !model?.trim()) {
    return NextResponse.json({ error: "brand and model required" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  if (id) {
    const { data, error } = await supabase
      .from("model_specs")
      .update({ brand: brand.trim(), model: model.trim(), spec_sheet })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("model_specs")
    .upsert(
      { brand: brand.trim(), model: model.trim(), spec_sheet },
      { onConflict: "brand,model" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("model_specs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
