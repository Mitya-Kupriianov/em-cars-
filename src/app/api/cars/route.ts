import { NextResponse } from "next/server";
import { requireAdmin, requireOwner } from "@/lib/admin-auth";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { getCars, createCar, updateCar, missingColumnFromError } from "@/lib/cars-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const adminMode = searchParams.get("admin") === "1";
  const archived = searchParams.get("archived") === "1";
  const filters = {
    brand: searchParams.get("brand") || undefined,
    model: searchParams.get("model") || undefined,
    bodyType: searchParams.get("bodyType") || undefined,
    status: searchParams.get("status") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    search: searchParams.get("search") || undefined,
    sort: (searchParams.get("sort") as "price_asc" | "price_desc" | "year_desc" | "range_desc") || undefined,
  };

  const cars = await getCars(filters, adminMode, archived);
  return NextResponse.json(cars);
}

export async function POST(req: Request) {
  const gate = await requireAdmin("editContent");
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const car = await createCar(body);

  if (!car) {
    return NextResponse.json({ error: "Failed to create car" }, { status: 500 });
  }

  return NextResponse.json(car, { status: 201 });
}

export async function PUT(req: Request) {
  const gate = await requireAdmin("editContent");
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await req.json();
  const { id: _id, created_at, updated_at, slug: _slug, specs, ...updates } = body;

  if (specs) {
    const supabaseRead = createSupabaseAdmin();
    const { data: existing } = await supabaseRead.from("cars").select("specs").eq("id", id).single();
    updates.specs = { ...(existing?.specs || {}), ...specs };
  }

  const supabase = createSupabaseAdmin();

  // Retry while the DB is missing optional columns (e.g. a migration not yet run),
  // dropping the offending column each time instead of failing the whole update.
  const payload: Record<string, unknown> = { ...updates };
  for (let i = 0; i < 6; i++) {
    const { data, error } = await supabase
      .from("cars")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (!error) return NextResponse.json(data);

    const col = missingColumnFromError(error);
    if (!col || !(col in payload)) {
      console.error("Update car error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    delete payload[col];
  }

  return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
}

export async function DELETE(req: Request) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const permanent = searchParams.get("permanent") === "1";
  const restore = searchParams.get("restore") === "1";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  // Restore from archive
  if (restore) {
    const { data, error } = await supabase
      .from("cars")
      .update({ archived_at: null })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Permanent delete
  if (permanent) {
    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Soft delete — move to archive
  const { data, error } = await supabase
    .from("cars")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // If archived_at column doesn't exist, fall back to hard delete
    if (error.code === "42703") {
      const { error: delErr } = await supabase.from("cars").delete().eq("id", id);
      if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, archived: true });
}
