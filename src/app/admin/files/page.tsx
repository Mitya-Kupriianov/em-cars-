"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

interface ImportResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: number;
}

export default function AdminFilesPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `electro-motors-cars-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Помилка експорту");
    }
    setExporting(false);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    setImportError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setImportResult(data);
      } else {
        setImportError(data.error || "Помилка імпорту");
      }
    } catch {
      setImportError("Помилка з'єднання");
    }

    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Файли</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Експорт та імпорт бази автомобілів у форматі Excel
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Export */}
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
            <Download className="h-6 w-6 text-brand-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Експорт</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Завантажити всю базу автомобілів у файл Excel (.xlsx).
            Файл містить всі поля: марка, модель, комплектація, ціни,
            характеристики, описи, посилання на фото.
          </p>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            {exporting ? "Завантаження..." : "Завантажити Excel"}
          </Button>
        </div>

        {/* Import */}
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Імпорт</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Завантажити Excel файл з автомобілями. Рядки з існуючим ID будуть
            оновлені, нові рядки (без ID або з новим ID) — додані.
          </p>
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            variant="outline"
          >
            {importing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {importing ? "Імпорт..." : "Обрати файл"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-brand-800">Імпорт завершено</span>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Всього рядків</div>
              <div className="text-lg font-bold">{importResult.total}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Створено</div>
              <div className="text-lg font-bold text-brand-600">{importResult.created}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Оновлено</div>
              <div className="text-lg font-bold text-blue-600">{importResult.updated}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Помилки</div>
              <div className="text-lg font-bold text-red-600">{importResult.errors}</div>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">{importError}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 rounded-xl border bg-muted p-5">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          <span className="font-semibold">Як користуватись</span>
        </div>
        <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
          <li>
            Натисніть <strong>Завантажити Excel</strong> — отримаєте файл з усіма
            автомобілями
          </li>
          <li>
            Відкрийте файл у Excel або Google Sheets, внесіть зміни
          </li>
          <li>
            Щоб <strong>оновити</strong> існуючий авто — залиште його <code className="rounded bg-muted px-1">id</code> без змін
          </li>
          <li>
            Щоб <strong>додати</strong> новий авто — залиште колонку <code className="rounded bg-muted px-1">id</code> порожньою
          </li>
          <li>
            Збережіть файл як <code className="rounded bg-muted px-1">.xlsx</code> і
            натисніть <strong>Обрати файл</strong> для імпорту
          </li>
        </ol>
      </div>
    </div>
  );
}
