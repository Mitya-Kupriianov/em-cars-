// Shared trilingual (UA / RU / EN) model-spec sheet types + helpers.
// spec_sheet is stored as JSONB, so the shape can evolve without a DB migration.
// Older sheets were bilingual ({ param_ua, param_ru, values }) — normalizeSheet
// upgrades them to the trilingual shape on read so every consumer is uniform.

export type Lang = "ua" | "ru" | "en";

export interface SpecRow {
  param_ua: string;
  param_ru: string;
  param_en: string;
  values_ua: string[];
  values_ru: string[];
  values_en: string[];
}

export interface SpecCategory {
  name_ua: string;
  name_ru: string;
  name_en: string;
  rows: SpecRow[];
}

export interface SpecSheet {
  trims: string[];
  /** Optional per-spec label (model year / series), e.g. "2025". Appended in
   *  parentheses to the export sheet tab and to every trim: "200KM MAX (2025)". */
  label?: string;
  categories: SpecCategory[];
}

/** Append the spec label to a trim name: "200KM MAX" + "2025" → "200KM MAX (2025)". */
export function withLabel(name: string, label?: string): string {
  const l = (label || "").trim();
  return l ? `${name} (${l})` : name;
}

/** Build the export/tab title: "Audi Q4 e-tron" or "Audi Q4 e-tron (2025)". */
export function sheetTitle(brand: string, model: string, label?: string): string {
  return withLabel(`${brand} ${model}`.trim(), label);
}

// ---- Legacy (bilingual) shape, for migration ----
interface LegacyRow {
  param_ua?: string;
  param_ru?: string;
  param_en?: string;
  values?: string[];
  values_ua?: string[];
  values_ru?: string[];
  values_en?: string[];
}
interface LegacyCategory {
  name_ua?: string;
  name_ru?: string;
  name_en?: string;
  rows?: LegacyRow[];
}
interface LegacySheet {
  trims?: string[];
  label?: string;
  categories?: LegacyCategory[];
}

/** Split a legacy "UA | RU | EN" packed value into its three parts. */
function splitPacked(value: string): [string, string, string] {
  const v = value ?? "";
  if (v.includes("|")) {
    const p = v.split("|").map((s) => s.trim());
    return [p[0] ?? "", p[1] ?? p[0] ?? "", p[2] ?? p[1] ?? p[0] ?? ""];
  }
  return [v, v, v];
}

/** Upgrade any sheet (legacy or new) to the canonical trilingual shape. */
export function normalizeSheet(input: unknown): SpecSheet {
  const sheet = (input || {}) as LegacySheet;
  const trims = Array.isArray(sheet.trims) ? sheet.trims.map((t) => String(t ?? "")) : [];
  const n = trims.length;

  const categories: SpecCategory[] = (sheet.categories || []).map((cat) => {
    const name_ua = cat.name_ua ?? "";
    const name_ru = cat.name_ru ?? name_ua;
    const name_en = cat.name_en ?? name_ru;

    const rows: SpecRow[] = (cat.rows || []).map((row) => {
      const param_ua = row.param_ua ?? "";
      const param_ru = row.param_ru ?? param_ua;
      const param_en = row.param_en ?? param_ru;

      // Prefer explicit trilingual arrays; otherwise derive from legacy `values`.
      const hasTri = Array.isArray(row.values_ua);
      const legacy = Array.isArray(row.values) ? row.values : [];
      const values_ua: string[] = [];
      const values_ru: string[] = [];
      const values_en: string[] = [];
      for (let i = 0; i < n; i++) {
        if (hasTri) {
          values_ua.push(row.values_ua?.[i] ?? "");
          values_ru.push(row.values_ru?.[i] ?? row.values_ua?.[i] ?? "");
          values_en.push(row.values_en?.[i] ?? row.values_ru?.[i] ?? row.values_ua?.[i] ?? "");
        } else {
          const [ua, ru, en] = splitPacked(legacy[i] ?? "");
          values_ua.push(ua);
          values_ru.push(ru);
          values_en.push(en);
        }
      }
      return { param_ua, param_ru, param_en, values_ua, values_ru, values_en };
    });

    return { name_ua, name_ru, name_en, rows };
  });

  const label = typeof sheet.label === "string" ? sheet.label : "";
  return { trims, label, categories };
}

export function paramByLang(row: SpecRow, lang: Lang): string {
  return lang === "ua" ? row.param_ua : lang === "en" ? row.param_en : row.param_ru;
}

export function valuesByLang(row: SpecRow, lang: Lang): string[] {
  return lang === "ua" ? row.values_ua : lang === "en" ? row.values_en : row.values_ru;
}

export function catNameByLang(cat: SpecCategory, lang: Lang): string {
  return lang === "ua" ? cat.name_ua : lang === "en" ? cat.name_en : cat.name_ru;
}
