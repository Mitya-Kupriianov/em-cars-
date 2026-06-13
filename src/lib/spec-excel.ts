// Builds a styled trilingual (UA/RU/EN) .xlsx workbook from model spec sheets.
// Shared by the export API route (Node) and the admin page (browser) so both
// produce identical output. Uses xlsx-js-style (a style-capable SheetJS fork).
import XLSX from "xlsx-js-style";
import { normalizeSheet, SpecSheet, withLabel, sheetTitle } from "./spec-sheet";

export interface ExportSpec {
  brand: string;
  model: string;
  spec_sheet: unknown;
}

type Style = NonNullable<unknown>;

const HEADER_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "2F75B6" } },
  alignment: { vertical: "center", wrapText: true },
};
const CATEGORY_STYLE = {
  font: { bold: true, sz: 13, color: { rgb: "1A1A1A" } },
  fill: { patternType: "solid", fgColor: { rgb: "D9D9D9" } },
  alignment: { vertical: "center" },
};
const PARAM_NAME_STYLE = {
  font: { bold: true, sz: 10, color: { rgb: "333333" } },
  fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } },
  alignment: { vertical: "center", wrapText: true },
  border: thinBorder(),
};
const VALUE_STYLE = {
  font: { sz: 10 },
  alignment: { vertical: "center", wrapText: true },
  border: thinBorder(),
};

function thinBorder() {
  const side = { style: "thin", color: { rgb: "D0D0D0" } };
  return { top: side, bottom: side, left: side, right: side };
}

type RowKind = "header" | "blank" | "category" | "param";

/**
 * Build a worksheet for one spec.
 * trimIndices selects which trims to include (defaults to all).
 */
function buildSheet(spec: ExportSpec, trimIndices?: number[]) {
  const sheet: SpecSheet = normalizeSheet(spec.spec_sheet);
  const allIdx = sheet.trims.map((_, i) => i);
  const idx = trimIndices && trimIndices.length ? trimIndices : allIdx;

  const aoa: string[][] = [];
  const kinds: RowKind[] = [];

  // Row 1 — header with language tags
  const header = ["Характеристика (UA)", "Характеристика (RU)", "Specification (EN)"];
  for (const i of idx) {
    const t = withLabel(sheet.trims[i] ?? `Trim ${i + 1}`, sheet.label);
    header.push(`${t} (UA)`, `${t} (RU)`, `${t} (EN)`);
  }
  aoa.push(header);
  kinds.push("header");

  // Row 2 — blank
  aoa.push([]);
  kinds.push("blank");

  for (const cat of sheet.categories) {
    const catRow = [cat.name_ua, cat.name_ru, cat.name_en];
    for (const _ of idx) catRow.push("", "", "");
    aoa.push(catRow);
    kinds.push("category");

    for (const row of cat.rows) {
      const r = [row.param_ua, row.param_ru, row.param_en];
      for (const i of idx) {
        r.push(row.values_ua[i] ?? "", row.values_ru[i] ?? "", row.values_en[i] ?? "");
      }
      aoa.push(r);
      kinds.push("param");
    }

    aoa.push([]);
    kinds.push("blank");
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const colCount = 3 + idx.length * 3;

  // Apply styles cell-by-cell
  for (let r = 0; r < kinds.length; r++) {
    const kind = kinds[r];
    for (let c = 0; c < colCount; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      let style: Style;
      if (kind === "header") style = HEADER_STYLE;
      else if (kind === "category") style = CATEGORY_STYLE;
      else if (kind === "param") style = c < 3 ? PARAM_NAME_STYLE : VALUE_STYLE;
      else continue; // blank rows: no style
      (ws[addr] as { s?: Style }).s = style;
    }
  }

  // Column widths: A/B/C = 42, value columns = 30
  ws["!cols"] = [{ wch: 42 }, { wch: 42 }, { wch: 42 }, ...idx.flatMap(() => [{ wch: 30 }, { wch: 30 }, { wch: 30 }])];
  // Header row a bit taller
  ws["!rows"] = [{ hpt: 26 }];

  return ws;
}

function sanitizeSheetName(name: string, used: Set<string>): string {
  let s = name.replace(/[\\/*?:\[\]]/g, "").slice(0, 31) || "Sheet";
  if (used.has(s.toLowerCase())) {
    let n = 2;
    while (used.has(`${s.slice(0, 28)} (${n})`.toLowerCase())) n++;
    s = `${s.slice(0, 28)} (${n})`;
  }
  used.add(s.toLowerCase());
  return s;
}

/** Build a workbook for one or more specs. Optional single-trim selection. */
export function buildSpecWorkbook(specs: ExportSpec[], opts?: { trimIndex?: number }) {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();
  for (const spec of specs) {
    const trimIndices = opts?.trimIndex != null ? [opts.trimIndex] : undefined;
    const norm = normalizeSheet(spec.spec_sheet);
    const ws = buildSheet(spec, trimIndices);
    let base = sheetTitle(spec.brand, spec.model, norm.label);
    if (opts?.trimIndex != null) {
      const t = norm.trims[opts.trimIndex];
      if (t) base = withLabel(`${spec.brand} ${spec.model} ${t}`.trim(), norm.label);
    }
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(base, used));
  }
  return wb;
}

/** Write workbook to a Node Buffer (for API responses). */
export function workbookToBuffer(wb: ReturnType<typeof buildSpecWorkbook>): Buffer {
  const arr = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return Buffer.from(arr);
}

/** Trigger a browser download of the workbook (client-side only). */
export function downloadWorkbook(wb: ReturnType<typeof buildSpecWorkbook>, filename: string): void {
  XLSX.writeFile(wb, filename);
}
