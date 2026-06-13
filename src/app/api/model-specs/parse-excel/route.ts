import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import * as XLSX from "xlsx";
import { SpecCategory } from "@/lib/spec-sheet";

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

/** Strip a trailing language tag like " (UA)" / "(RU)" / "(EN)". */
function stripLangTag(name: string): string {
  return name.replace(/\s*\((?:ua|ru|en|укр|рус|eng)\)\s*$/i, "").trim();
}

function allEmpty(cells: unknown[], from: number): boolean {
  return cells.slice(from).every((c) => cell(c) === "");
}

/** brand/model from a filename like "Mazda_EZ-60_specs_ua_ru_en.xlsx". */
function fromFilename(name: string): { brand: string; model: string } {
  const base = name.replace(/\.[^.]+$/, "");
  const stop = base.toLowerCase().indexOf("_specs");
  const head = stop >= 0 ? base.slice(0, stop) : base;
  const parts = head.split(/[_\s]+/).filter(Boolean);
  return { brand: parts[0] || "", model: parts.slice(1).join(" ") || "" };
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin("editContent");
  if (gate instanceof NextResponse) return gate;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (rows.length < 2) {
      return NextResponse.json({ error: "Файл порожній або має менше 2 рядків" }, { status: 400 });
    }

    // Find header row (first 10 rows): first cell mentions параметр/характеристик/комплектац.
    let headerRowIdx = 0;
    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const first = cell(rows[i][0]).toLowerCase();
      if (first.includes("комплектац") || first.includes("параметр") || first.includes("характеристик")) {
        headerRowIdx = i;
        break;
      }
    }
    const headerRow = rows[headerRowIdx];
    const colCount = Math.max(...rows.map((r) => r.length));

    // Trilingual when the 3rd header cell is a language column and the remaining
    // columns come in groups of three (UA/RU/EN per trim).
    const thirdTag = cell(headerRow[2]).toLowerCase();
    const looksTrilingual =
      colCount >= 6 &&
      (colCount - 3) % 3 === 0 &&
      (thirdTag.includes("(en)") || thirdTag.includes("specification") || /\(en\)/i.test(cell(headerRow[5])));

    // brand/model: filename first, then sheet name / trims below.
    let { brand, model } = fromFilename(file.name || "");

    const categories: SpecCategory[] = [];
    let current: SpecCategory | null = null;

    function ensureCategory(): SpecCategory {
      if (!current) {
        current = { name_ua: "Основні характеристики", name_ru: "Основные характеристики", name_en: "Basic", rows: [] };
        categories.push(current);
      }
      return current;
    }

    if (looksTrilingual) {
      const trims: string[] = [];
      for (let c = 3; c < colCount; c += 3) {
        trims.push(stripLangTag(cell(headerRow[c])) || `Комплектація ${(c - 3) / 3 + 1}`);
      }
      const n = trims.length;

      for (let i = headerRowIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        const a = cell(row[0]), b = cell(row[1]), c = cell(row[2]);
        if (!a && !b && !c && allEmpty(row, 3)) continue; // blank separator

        // Category: name columns present, all value columns empty.
        if ((a || b || c) && allEmpty(row, 3)) {
          current = { name_ua: a, name_ru: b || a, name_en: c || b || a, rows: [] };
          categories.push(current);
          continue;
        }

        const cat = ensureCategory();
        const values_ua: string[] = [], values_ru: string[] = [], values_en: string[] = [];
        for (let t = 0; t < n; t++) {
          values_ua.push(cell(row[3 + t * 3]));
          values_ru.push(cell(row[4 + t * 3]));
          values_en.push(cell(row[5 + t * 3]));
        }
        cat.rows.push({ param_ua: a, param_ru: b || a, param_en: c || b || a, values_ua, values_ru, values_en });
      }

      if (!brand) {
        const parts = (trims[0] || "").split(/\s+/);
        brand = parts[0] || "";
        model = parts[1] || "";
      }
      return NextResponse.json({ brand, model, trims, categories });
    }

    // ---- Legacy bilingual format: 1 param column + 1 column per trim ----
    const trims = (headerRow as unknown[]).slice(1).map((c) => cell(c)).filter((c) => c.length > 0);
    if (trims.length === 0) {
      return NextResponse.json({ error: "Не знайдено комплектацій у заголовку" }, { status: 400 });
    }
    const n = trims.length;
    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      const a = cell(row[0]);
      if (!a) continue;
      if (allEmpty(row, 1)) {
        current = { name_ua: a, name_ru: a, name_en: a, rows: [] };
        categories.push(current);
        continue;
      }
      const cat = ensureCategory();
      const vals: string[] = [];
      for (let t = 0; t < n; t++) vals.push(cell(row[t + 1]).replace(/✓/g, "+") || "—");
      cat.rows.push({ param_ua: a, param_ru: a, param_en: a, values_ua: vals, values_ru: vals, values_en: vals });
    }
    if (!brand && sheetName && sheetName !== "Sheet1" && sheetName !== "Лист1") {
      const parts = sheetName.split(/\s+/);
      brand = parts[0] || "";
      model = parts.slice(1).join(" ") || "";
    }
    return NextResponse.json({ brand, model, trims, categories });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to parse Excel";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
