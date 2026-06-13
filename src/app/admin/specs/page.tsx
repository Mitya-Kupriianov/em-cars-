"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Upload,
  FileText,
  FileSpreadsheet,
  Download,
  ChevronDown,
  ChevronRight,
  X,
  Pencil,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  Lang,
  SpecSheet,
  SpecCategory,
  normalizeSheet,
} from "@/lib/spec-sheet";

interface ModelSpec {
  id: string;
  brand: string;
  model: string;
  spec_sheet: SpecSheet;
  created_at: string;
  updated_at: string;
}

const EMPTY_SHEET: SpecSheet = { trims: [], categories: [] };

const DEFAULT_CATEGORIES: { name_ua: string; name_ru: string; name_en: string }[] = [
  { name_ua: "Основні характеристики", name_ru: "Основные характеристики", name_en: "Basic Parameters" },
  { name_ua: "Габарити", name_ru: "Габариты", name_en: "Dimensions" },
  { name_ua: "Двигун", name_ru: "Двигатель", name_en: "Engine" },
  { name_ua: "Батарея", name_ru: "Батарея", name_en: "Battery" },
  { name_ua: "Безпека", name_ru: "Безопасность", name_en: "Safety" },
  { name_ua: "Підвіска та колеса", name_ru: "Подвеска и колёса", name_en: "Suspension & Wheels" },
  { name_ua: "Мультимедіа", name_ru: "Мультимедиа", name_en: "Multimedia" },
  { name_ua: "Комфорт", name_ru: "Комфорт", name_en: "Comfort" },
];

const LANGS: Lang[] = ["ua", "ru", "en"];

export default function AdminSpecsPage() {
  const [specs, setSpecs] = useState<ModelSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);

  // Editor state
  const [editing, setEditing] = useState<ModelSpec | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [sheet, setSheet] = useState<SpecSheet>(EMPTY_SHEET);
  const [editLang, setEditLang] = useState<Lang>("ua");
  const [exportTrim, setExportTrim] = useState<string>("all");
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const excelRef = useRef<HTMLInputElement>(null);

  // Field keys for the currently-selected language
  const paramField = editLang === "ua" ? "param_ua" : editLang === "en" ? "param_en" : "param_ru";
  const valuesField = editLang === "ua" ? "values_ua" : editLang === "en" ? "values_en" : "values_ru";
  const nameField = editLang === "ua" ? "name_ua" : editLang === "en" ? "name_en" : "name_ru";

  useEffect(() => {
    loadSpecs();
  }, []);

  async function loadSpecs() {
    try {
      const res = await fetch("/api/model-specs");
      const data = await res.json();
      setSpecs(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  function startNew() {
    setEditing(null);
    setBrand("");
    setModel("");
    setEditLang("ua");
    setExportTrim("all");
    setSheet({ trims: [""], categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, rows: [] })) });
    setExpandedCats(new Set([0]));
  }

  function startEdit(spec: ModelSpec) {
    setEditing(spec);
    setBrand(spec.brand);
    setModel(spec.model);
    setEditLang("ua");
    setExportTrim("all");
    setSheet(normalizeSheet(spec.spec_sheet));
    setExpandedCats(new Set());
  }

  function cancelEdit() {
    setEditing(null);
    setBrand("");
    setModel("");
    setSheet(EMPTY_SHEET);
  }

  async function handleSave() {
    if (!brand.trim() || !model.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/model-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing?.id, brand, model, spec_sheet: sheet }),
      });
      if (res.ok) {
        cancelEdit();
        loadSpecs();
      }
    } catch { /* ignore */ }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/model-specs?id=${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    loadSpecs();
  }

  // Server-side export for a saved spec (whole sheet)
  function exportExcel(specId?: string) {
    const url = specId
      ? `/api/model-specs/export-excel?id=${specId}`
      : `/api/model-specs/export-excel`;
    window.open(url, "_blank");
  }

  // Client-side export of the CURRENT editor state (reflects unsaved edits).
  // trimIndex undefined → whole sheet; otherwise just that trim.
  async function exportCurrent(trimIndex?: number) {
    if (!brand.trim() || !model.trim()) return;
    const { buildSpecWorkbook, downloadWorkbook } = await import("@/lib/spec-excel");
    const wb = buildSpecWorkbook(
      [{ brand, model, spec_sheet: sheet }],
      trimIndex != null ? { trimIndex } : undefined,
    );
    const suffix = trimIndex != null && sheet.trims[trimIndex]
      ? `_${sheet.trims[trimIndex].replace(/[^\p{L}\p{N}]+/gu, "-")}`
      : "";
    downloadWorkbook(wb, `${brand}_${model}${suffix}_specs_ua_ru_en.xlsx`.replace(/\s+/g, "_"));
  }

  function handleExportClick() {
    if (exportTrim === "all") exportCurrent();
    else exportCurrent(Number(exportTrim));
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/model-specs/parse-pdf", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) alert("Помилка парсингу: " + data.error);
      else applyParsed(data);
    } catch {
      alert("Помилка завантаження PDF");
    }
    setParsing(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/model-specs/parse-excel", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) alert("Помилка парсингу: " + data.error);
      else applyParsed(data);
    } catch {
      alert("Помилка завантаження Excel");
    }
    setParsing(false);
    if (excelRef.current) excelRef.current.value = "";
  }

  function applyParsed(data: { brand?: string; model?: string; trims?: string[]; categories?: SpecCategory[] }) {
    setEditing(null);
    setBrand(data.brand || "");
    setModel(data.model || "");
    setEditLang("ua");
    setExportTrim("all");
    setSheet(normalizeSheet({ trims: data.trims || [], categories: data.categories || [] }));
    setExpandedCats(new Set((data.categories || []).map((_, i) => i)));
  }

  // ---- Sheet mutations ----
  function updateTrim(index: number, value: string) {
    const trims = [...sheet.trims];
    trims[index] = value;
    setSheet({ ...sheet, trims });
  }

  function addTrim() {
    const trims = [...sheet.trims, ""];
    const categories = sheet.categories.map((cat) => ({
      ...cat,
      rows: cat.rows.map((r) => ({
        ...r,
        values_ua: [...r.values_ua, ""],
        values_ru: [...r.values_ru, ""],
        values_en: [...r.values_en, ""],
      })),
    }));
    setSheet({ trims, categories });
  }

  function removeTrim(index: number) {
    const trims = sheet.trims.filter((_, i) => i !== index);
    const categories = sheet.categories.map((cat) => ({
      ...cat,
      rows: cat.rows.map((r) => ({
        ...r,
        values_ua: r.values_ua.filter((_, i) => i !== index),
        values_ru: r.values_ru.filter((_, i) => i !== index),
        values_en: r.values_en.filter((_, i) => i !== index),
      })),
    }));
    setSheet({ trims, categories });
  }

  function addCategory() {
    const categories = [...sheet.categories, { name_ua: "", name_ru: "", name_en: "", rows: [] }];
    setSheet({ ...sheet, categories });
    setExpandedCats(new Set([...expandedCats, categories.length - 1]));
  }

  function removeCategory(catIndex: number) {
    setSheet({ ...sheet, categories: sheet.categories.filter((_, i) => i !== catIndex) });
  }

  function updateCategoryName(catIndex: number, value: string) {
    const categories = [...sheet.categories];
    categories[catIndex] = { ...categories[catIndex], [nameField]: value };
    setSheet({ ...sheet, categories });
  }

  function addRow(catIndex: number) {
    const blank = sheet.trims.map(() => "");
    const categories = [...sheet.categories];
    categories[catIndex] = {
      ...categories[catIndex],
      rows: [
        ...categories[catIndex].rows,
        { param_ua: "", param_ru: "", param_en: "", values_ua: [...blank], values_ru: [...blank], values_en: [...blank] },
      ],
    };
    setSheet({ ...sheet, categories });
  }

  function removeRow(catIndex: number, rowIndex: number) {
    const categories = [...sheet.categories];
    categories[catIndex] = {
      ...categories[catIndex],
      rows: categories[catIndex].rows.filter((_, i) => i !== rowIndex),
    };
    setSheet({ ...sheet, categories });
  }

  function updateRowParam(catIndex: number, rowIndex: number, value: string) {
    const categories = [...sheet.categories];
    const row = { ...categories[catIndex].rows[rowIndex], [paramField]: value };
    categories[catIndex] = {
      ...categories[catIndex],
      rows: categories[catIndex].rows.map((r, i) => (i === rowIndex ? row : r)),
    };
    setSheet({ ...sheet, categories });
  }

  function updateRowValue(catIndex: number, rowIndex: number, trimIndex: number, value: string) {
    const categories = [...sheet.categories];
    const row = { ...categories[catIndex].rows[rowIndex] };
    const values = [...(row[valuesField] as string[])];
    values[trimIndex] = value;
    (row as Record<string, unknown>)[valuesField] = values;
    categories[catIndex] = {
      ...categories[catIndex],
      rows: categories[catIndex].rows.map((r, i) => (i === rowIndex ? row : r)),
    };
    setSheet({ ...sheet, categories });
  }

  function toggleCat(index: number) {
    const next = new Set(expandedCats);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExpandedCats(next);
  }

  const isEditorOpen = brand !== "" || model !== "" || sheet.trims.length > 0;
  const langLabel = editLang.toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Технічні характеристики</h1>
          <p className="text-sm text-muted-foreground">
            Порівняльні таблиці комплектацій для моделей
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={parsing}>
            {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            PDF
          </Button>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
          <Button variant="outline" onClick={() => excelRef.current?.click()} disabled={parsing}>
            {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
            Excel
          </Button>
          <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
          {specs.length > 0 && !isEditorOpen && (
            <Button variant="outline" onClick={() => exportExcel()}>
              <Download className="mr-2 h-4 w-4" />
              Вигрузити всі
            </Button>
          )}
          <Button onClick={startNew}>
            <Plus className="mr-2 h-4 w-4" />
            Створити
          </Button>
        </div>
      </div>

      {/* Existing specs list */}
      {!isEditorOpen && (
        <div className="space-y-2">
          {specs.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <FileText className="mx-auto mb-2 h-8 w-8" />
              <p>Поки немає характеристик. Створіть або імпортуйте з Excel/PDF.</p>
            </div>
          )}
          {specs.map((spec) => (
            <div key={spec.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
              <div>
                <span className="font-semibold">{spec.brand}</span>{" "}
                <span className="text-muted-foreground">{spec.model}</span>
                {spec.spec_sheet.label && (
                  <span className="ml-2 rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {spec.spec_sheet.label}
                  </span>
                )}
                <div className="mt-1 flex flex-wrap gap-1">
                  {spec.spec_sheet.trims?.map((t, i) => (
                    <span key={i} className="rounded bg-zinc-100 px-2 py-0.5 text-xs">{t}</span>
                  ))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {spec.spec_sheet.categories?.length || 0} категорій •{" "}
                  {spec.spec_sheet.categories?.reduce((acc, c) => acc + (c.rows?.length || 0), 0) || 0} параметрів
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => exportExcel(spec.id)} title="Вигрузити в Excel (всі комплектації)">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => startEdit(spec)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => setConfirmDelete(spec.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      {isEditorOpen && (
        <div className="space-y-6 rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing ? "Редагування" : "Нова специфікація"}</h2>
            <div className="flex items-center gap-3">
              {/* Language switch */}
              <div className="inline-flex rounded-lg border p-0.5">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setEditLang(l)}
                    className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                      editLang === l ? "bg-brand-600 text-white" : "text-muted-foreground hover:bg-zinc-100"
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="-mt-3 text-xs text-muted-foreground">
            Редагується мова: <span className="font-semibold">{langLabel}</span>. Перемкніть, щоб редагувати інший переклад — рядки залишаються ті самі.
          </p>

          {/* Brand & Model & Label */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Бренд</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Mazda" />
            </div>
            <div>
              <Label>Модель</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="EZ-60" />
            </div>
            <div>
              <Label>Рік / мітка ряду</Label>
              <Input
                value={sheet.label || ""}
                onChange={(e) => setSheet({ ...sheet, label: e.target.value })}
                placeholder="2025"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Додається в дужках до вкладки та комплектацій: «{(model || "Модель")} ({sheet.label || "2025"})»
              </p>
            </div>
          </div>

          {/* Trims */}
          <div>
            <Label className="mb-2 block">Комплектації</Label>
            <div className="flex flex-wrap gap-2">
              {sheet.trims.map((trim, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Input
                    className="w-48"
                    value={trim}
                    onChange={(e) => updateTrim(i, e.target.value)}
                    placeholder={`Комплектація ${i + 1}`}
                  />
                  {sheet.trims.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => removeTrim(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addTrim}>
                <Plus className="mr-1 h-3 w-3" />
                Додати
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Категорії характеристик</Label>
              <Button size="sm" variant="outline" onClick={addCategory}>
                <Plus className="mr-1 h-3 w-3" />
                Категорія
              </Button>
            </div>

            {sheet.categories.map((cat, catIndex) => {
              const catName = (cat[nameField] as string) || cat.name_ua || cat.name_ru || `Категорія ${catIndex + 1}`;
              return (
                <div key={catIndex} className="rounded-lg border">
                  <div
                    className="flex cursor-pointer items-center gap-2 bg-zinc-50 px-4 py-3"
                    onClick={() => toggleCat(catIndex)}
                  >
                    {expandedCats.has(catIndex) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="flex-1 font-medium">{catName}</span>
                    <span className="text-xs text-muted-foreground">{cat.rows.length} параметрів</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500"
                      onClick={(e) => { e.stopPropagation(); removeCategory(catIndex); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {expandedCats.has(catIndex) && (
                    <div className="space-y-3 p-4">
                      <div>
                        <Input
                          placeholder={`Назва категорії (${langLabel})`}
                          value={(cat[nameField] as string) || ""}
                          onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                        />
                      </div>

                      {cat.rows.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-zinc-50">
                                <th className="px-2 py-1.5 text-left font-medium">Параметр ({langLabel})</th>
                                {sheet.trims.map((t, i) => (
                                  <th key={i} className="px-2 py-1.5 text-left font-medium">
                                    {t || `Компл. ${i + 1}`}
                                  </th>
                                ))}
                                <th className="w-8" />
                              </tr>
                            </thead>
                            <tbody>
                              {cat.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b last:border-0">
                                  <td className="px-2 py-1">
                                    <Input
                                      className="h-8 text-xs"
                                      value={(row[paramField] as string) || ""}
                                      onChange={(e) => updateRowParam(catIndex, rowIndex, e.target.value)}
                                    />
                                  </td>
                                  {sheet.trims.map((_, vi) => (
                                    <td key={vi} className="px-2 py-1">
                                      <Input
                                        className="h-8 text-xs"
                                        value={(row[valuesField] as string[])[vi] || ""}
                                        onChange={(e) => updateRowValue(catIndex, rowIndex, vi, e.target.value)}
                                      />
                                    </td>
                                  ))}
                                  <td className="px-1 py-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-red-500"
                                      onClick={() => removeRow(catIndex, rowIndex)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <Button size="sm" variant="outline" onClick={() => addRow(catIndex)}>
                        <Plus className="mr-1 h-3 w-3" />
                        Параметр
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save / Export */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
            <select
              value={exportTrim}
              onChange={(e) => setExportTrim(e.target.value)}
              className="h-9 rounded-md border bg-white px-2 text-sm"
            >
              <option value="all">Усі комплектації</option>
              {sheet.trims.map((t, i) => (
                <option key={i} value={String(i)}>{t || `Комплектація ${i + 1}`}</option>
              ))}
            </select>
            <Button variant="outline" onClick={handleExportClick} disabled={!brand.trim() || !model.trim()}>
              <Download className="mr-2 h-4 w-4" />
              Вигрузити Excel
            </Button>
            <Button variant="outline" onClick={cancelEdit}>Скасувати</Button>
            <Button onClick={handleSave} disabled={saving || !brand.trim() || !model.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Зберегти
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Видалити специфікацію?"
        description="Цю дію неможливо скасувати."
      />
    </div>
  );
}
