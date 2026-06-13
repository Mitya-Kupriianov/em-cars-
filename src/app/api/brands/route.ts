import { NextResponse } from "next/server";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured()) {
    const { brands } = await import("@/lib/data");
    return NextResponse.json(brands.map((name: string, i: number) => ({ id: String(i), name, sort_order: 0, models: [] })));
  }

  const supabase = createSupabaseAdmin();

  // Try fetching with trims
  let { data, error } = await supabase
    .from("brands")
    .select("*, brand_models(*, model_trims(*))")
    .order("name", { ascending: true });

  // Fallback: without trims
  if (error && (error.code === "42P01" || error.message?.includes("model_trims"))) {
    ({ data, error } = await supabase
      .from("brands")
      .select("*, brand_models(*)")
      .order("name", { ascending: true }));
  }

  // Fallback: without models
  if (error && (error.code === "42P01" || error.message?.includes("brand_models"))) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });
    if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    return NextResponse.json((fallback || []).map((b: Record<string, unknown>) => ({ ...b, models: [] })));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = (data || []).map((b: Record<string, unknown>) => ({
    ...b,
    models: ((b.brand_models as Array<Record<string, unknown>>) || [])
      .map((m: Record<string, unknown>) => ({
        ...m,
        trims: ((m.model_trims as Array<Record<string, unknown>>) || []).sort(
          (a: Record<string, unknown>, b: Record<string, unknown>) => String(a.name).localeCompare(String(b.name))
        ),
      }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => String(a.name).localeCompare(String(b.name))),
  }));
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const supabase = createSupabaseAdmin();

  // Add trim to model
  if (body.action === "add-trim") {
    const { model_id, name } = body;
    if (!model_id || !name?.trim()) {
      return NextResponse.json({ error: "model_id and name required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("model_trims")
      .insert({ model_id, name: name.trim() })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  // Add model to brand
  if (body.action === "add-model") {
    const { brand_id, name } = body;
    if (!brand_id || !name?.trim()) {
      return NextResponse.json({ error: "brand_id and name required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("brand_models")
      .insert({ brand_id, name: name.trim() })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  // Add brand
  const { name } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("brands")
    .insert({ name: name.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const supabase = createSupabaseAdmin();

  // Rename trim
  if (body.action === "rename-trim") {
    const { id, name } = body;
    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "id and name required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("model_trims")
      .update({ name: name.trim() })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Rename model
  if (body.action === "rename-model") {
    const { id, name } = body;
    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "id and name required" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("brand_models")
      .update({ name: name.trim() })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Rename brand
  const { id, name } = body;
  if (!id || !name?.trim()) {
    return NextResponse.json({ error: "id and name required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("brands")
    .update({ name: name.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const modelId = searchParams.get("modelId");
  const trimId = searchParams.get("trimId");

  const supabase = createSupabaseAdmin();

  // Delete trim
  if (trimId) {
    const { error } = await supabase.from("model_trims").delete().eq("id", trimId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Delete model (cascades trims)
  if (modelId) {
    const { error } = await supabase.from("brand_models").delete().eq("id", modelId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Delete brand
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
