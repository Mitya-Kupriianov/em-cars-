import { NextResponse } from "next/server";
import { createSupabaseBrowser, createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const localRequests: Array<Record<string, unknown>> = [];

export async function POST(req: Request) {
  const body = await req.json();

  const { name, phone, type } = body;
  if (!name || !phone || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    const entry = {
      ...body,
      id: crypto.randomUUID(),
      status: "new",
      created_at: new Date().toISOString(),
    };
    localRequests.push(entry);
    return NextResponse.json({ success: true, id: entry.id });
  }

  const supabase = createSupabaseBrowser();
  const { data, error } = await supabase
    .from("contact_requests")
    .insert({
      name,
      phone,
      email: body.email || null,
      car_id: body.car_id || null,
      message: body.message || null,
      type,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(localRequests);
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("contact_requests")
    .select("*, cars(brand, model)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
