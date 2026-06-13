import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin-auth";
import * as XLSX from "xlsx";
import { getCars } from "@/lib/cars-service";

export async function GET() {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  try {
    const cars = await getCars(undefined, true);

    const rows = cars.map((car, i) => ({
      "№": i + 1,
      brand: car.brand,
      model: car.model,
      trim: car.trim || "",
      year: car.year,
      price_usd: car.price_usd,
      price_uah: car.price_uah,
      range_km: car.range_km,
      battery_kwh: car.battery_kwh,
      power_hp: car.power_hp,
      acceleration_0_100: car.acceleration_0_100 ?? "",
      drive_type: car.drive_type,
      body_type: car.body_type,
      color: car.color,
      mileage_km: car.mileage_km,
      status: car.status,
      is_new: car.is_new ? "TRUE" : "FALSE",
      is_visible: car.is_visible !== false ? "TRUE" : "FALSE",
      features: (car.specs?.features || []).join(" | "),
      description_ua: car.description_ua,
      description_ru: car.description_ru,
      description_en: car.description_en,
      thumbnail: car.thumbnail,
      images: (car.images || []).join(" | "),
      slug: car.slug,
      id: car.id,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    ws["!cols"] = [
      { wch: 4 },  // №
      { wch: 14 }, // brand
      { wch: 28 }, // model
      { wch: 16 }, // trim
      { wch: 6 },  // year
      { wch: 10 }, // price_usd
      { wch: 12 }, // price_uah
      { wch: 10 }, // range_km
      { wch: 12 }, // battery_kwh
      { wch: 10 }, // power_hp
      { wch: 16 }, // acceleration
      { wch: 10 }, // drive_type
      { wch: 14 }, // body_type
      { wch: 12 }, // color
      { wch: 12 }, // mileage_km
      { wch: 10 }, // status
      { wch: 6 },  // is_new
      { wch: 8 },  // is_visible
      { wch: 40 }, // features
      { wch: 40 }, // description_ua
      { wch: 40 }, // description_ru
      { wch: 40 }, // description_en
      { wch: 50 }, // thumbnail
      { wch: 60 }, // images
      { wch: 40 }, // slug
      { wch: 36 }, // id
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Cars");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="electro-motors-cars-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
