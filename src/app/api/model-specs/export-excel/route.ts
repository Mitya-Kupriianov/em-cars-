import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { buildSpecWorkbook, workbookToBuffer, ExportSpec } from "@/lib/spec-excel";
import { normalizeSheet } from "@/lib/spec-sheet";

interface ModelSpec extends ExportSpec {
  id: string;
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin("editContent");
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const id = req.nextUrl.searchParams.get("id");
  const trimParam = req.nextUrl.searchParams.get("trim"); // optional single-trim index
  const supabase = createSupabaseAdmin();

  let specs: ModelSpec[] = [];

  if (id) {
    const { data, error } = await supabase.from("model_specs").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    specs = [data];
  } else {
    const { data, error } = await supabase.from("model_specs").select("*").order("brand").order("model");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    specs = data || [];
  }

  if (specs.length === 0) {
    return NextResponse.json({ error: "No specs to export" }, { status: 404 });
  }

  const trimIndex = trimParam != null && trimParam !== "" ? Number(trimParam) : undefined;
  const wb = buildSpecWorkbook(specs, trimIndex != null && !Number.isNaN(trimIndex) ? { trimIndex } : undefined);
  const buf = workbookToBuffer(wb);

  let filename = "all_specs_ua_ru_en.xlsx";
  if (specs.length === 1) {
    const s = specs[0];
    let suffix = "";
    if (trimIndex != null) {
      const t = normalizeSheet(s.spec_sheet).trims[trimIndex];
      if (t) suffix = `_${t.replace(/[^\p{L}\p{N}]+/gu, "-")}`;
    }
    filename = `${s.brand}_${s.model}${suffix}_specs_ua_ru_en.xlsx`.replace(/\s+/g, "_");
  }

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
