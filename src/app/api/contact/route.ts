import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseBrowser, createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const localRequests: Array<Record<string, unknown>> = [];

// Простая защита от спама: не больше N заявок с одного IP за окно времени.
// В serverless память не общая между инстансами, но в пределах тёплого
// инстанса режет автоматизированный флуд. Для жёстких гарантий нужен
// внешний лимитер (Upstash/Redis).
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear(); // защита от роста памяти
  return hits.length > RATE_LIMIT;
}

const LIMITS = { name: 100, phone: 32, email: 200, message: 2000, type: 40, car_id: 64 };

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Забагато запитів. Спробуйте пізніше." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const car_id = typeof body.car_id === "string" ? body.car_id.trim() : "";

  if (!name || !phone || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (
    name.length > LIMITS.name ||
    phone.length > LIMITS.phone ||
    type.length > LIMITS.type ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message ||
    car_id.length > LIMITS.car_id
  ) {
    return NextResponse.json({ error: "Field too long" }, { status: 400 });
  }
  if (!/^[+\d][\d\s()-]{4,}$/.test(phone)) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    const entry = {
      name,
      phone,
      type,
      email: email || null,
      car_id: car_id || null,
      message: message || null,
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
      email: email || null,
      car_id: car_id || null,
      message: message || null,
      type,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Contact insert error:", error.message);
    return NextResponse.json({ error: "Не вдалося зберегти заявку" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data.id });
}

export async function GET() {
  const gate = await requireAdmin("viewRequests");
  if (gate instanceof NextResponse) return gate;

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
