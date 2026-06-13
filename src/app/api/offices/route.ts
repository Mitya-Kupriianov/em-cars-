import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin-auth";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { offices as defaultOffices } from "@/lib/data";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(defaultOffices);
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return NextResponse.json(defaultOffices);
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json();
  const supabase = createSupabaseAdmin();

  if (body.id) {
    const { id, created_at, ...updates } = body;
    const { data, error } = await supabase
      .from("offices")
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
    .from("offices")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: Request) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // Bulk save — replace all offices
  const offices = await req.json();
  const supabase = createSupabaseAdmin();

  // Delete all existing
  await supabase.from("offices").delete().gte("sort_order", 0);

  if (!Array.isArray(offices) || offices.length === 0) {
    return NextResponse.json([]);
  }

  const toInsert = offices.map((o: Record<string, unknown>, i: number) => {
    const { id, created_at, ...rest } = o;
    return { ...rest, sort_order: i };
  });

  const { data, error } = await supabase
    .from("offices")
    .insert(toInsert)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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
  const { error } = await supabase.from("offices").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
