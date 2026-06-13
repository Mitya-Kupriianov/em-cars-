import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    if (!rows.length) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const row of rows) {
      const id = row.id ? String(row.id).trim() : "";
      const brand = String(row.brand || "").trim();
      const model = String(row.model || "").trim();
      const year = Number(row.year) || 2025;

      if (!brand || !model) {
        errors++;
        continue;
      }

      const trimVal = String(row.trim || "").trim();
      const slugBase = [brand, model, trimVal, String(year)].filter(Boolean)
        .join("-")
        .toLowerCase()
        .replace(/[^a-zа-яёіїєґ0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingSlug = row.slug ? String(row.slug).trim() : "";
      let slug = (id && existingSlug) ? existingSlug : slugBase;

      // Ensure unique slug for new records
      if (!id || !existingSlug) {
        const { data: existing } = await supabase
          .from("cars")
          .select("slug")
          .like("slug", `${slugBase}%`);
        const taken = new Set((existing || []).map((r: { slug: string }) => r.slug));
        if (taken.has(slug)) {
          let n = 2;
          while (taken.has(`${slugBase}-${n}`)) n++;
          slug = `${slugBase}-${n}`;
        }
      }

      const imagesStr = String(row.images || "");
      const images = imagesStr ? imagesStr.split("|").map((s: string) => s.trim()).filter(Boolean) : [];

      const featuresStr = String(row.features || "");
      const features = featuresStr ? featuresStr.split("|").map((s: string) => s.trim()).filter(Boolean) : [];

      const carData: Record<string, unknown> = {
        brand,
        model,
        trim: trimVal,
        year,
        slug,
        price_usd: Number(row.price_usd) || 0,
        price_uah: Number(row.price_uah) || 0,
        range_km: Number(row.range_km) || 0,
        battery_kwh: Number(row.battery_kwh) || 0,
        power_hp: Number(row.power_hp) || 0,
        acceleration_0_100: row.acceleration_0_100 ? Number(row.acceleration_0_100) : null,
        drive_type: String(row.drive_type || "FWD"),
        body_type: String(row.body_type || "EV"),
        color: String(row.color || "—"),
        mileage_km: Number(row.mileage_km) || 0,
        status: String(row.status || "on_order"),
        is_new: String(row.is_new).toUpperCase() !== "FALSE",
        is_visible: String(row.is_visible).toUpperCase() !== "FALSE",
        description_ua: String(row.description_ua || ""),
        description_ru: String(row.description_ru || ""),
        description_en: String(row.description_en || ""),
        thumbnail: String(row.thumbnail || images[0] || ""),
        images,
      };

      if (features.length > 0) {
        carData.specs = { features };
      }

      if (id) {
        // Try to update existing car
        const { error } = await supabase
          .from("cars")
          .update(carData)
          .eq("id", id);

        if (error) {
          // If car with this id doesn't exist, insert
          const { error: insertError } = await supabase
            .from("cars")
            .insert({ ...carData, id });
          if (insertError) {
            console.error("Import insert error:", insertError.message);
            errors++;
          } else {
            created++;
          }
        } else {
          updated++;
        }
      } else {
        // New car — insert
        const { error } = await supabase
          .from("cars")
          .insert(carData);

        if (error) {
          console.error("Import insert error:", error.message);
          errors++;
        } else {
          created++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      created,
      updated,
      errors,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
