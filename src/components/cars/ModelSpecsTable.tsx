"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale } from "@/hooks/use-locale";
import { ChevronDown } from "lucide-react";
import {
  Lang,
  SpecSheet,
  normalizeSheet,
  paramByLang,
  valuesByLang,
  catNameByLang,
  withLabel,
} from "@/lib/spec-sheet";

export type { SpecSheet };

interface ModelSpec {
  id: string;
  brand: string;
  model: string;
  spec_sheet: SpecSheet;
}

function localeToLang(locale: string): Lang {
  return locale === "ua" ? "ua" : locale === "en" ? "en" : "ru";
}

function ValueCell({ value }: { value: string }) {
  const v = (value || "").trim();
  if (v === "+" || v === "✓") {
    return <span className="font-medium text-brand">+</span>;
  }
  if (v === "" || v === "-" || v === "—") {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span>{v}</span>;
}

export function useModelSpecs(brand: string, model: string) {
  const [spec, setSpec] = useState<ModelSpec | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brand) {
      setSpec(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    async function load() {
      try {
        const res = await fetch(`/api/model-specs?brand=${encodeURIComponent(brand)}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const exact = data.find((s: ModelSpec) => s.model === model);
          const startsWith = data.find((s: ModelSpec) => model.startsWith(s.model));
          const contains = data.find((s: ModelSpec) => model.includes(s.model) || s.model.includes(model.split(" ").slice(0, 2).join(" ")));
          setSpec(exact || startsWith || contains || null);
        } else {
          setSpec(null);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [brand, model]);

  return { spec, loading };
}

export function ModelSpecsContent({ sheet, modelName }: { sheet: SpecSheet; modelName?: string }) {
  const { locale } = useLocale();
  const lang = localeToLang(locale);
  const norm = useMemo(() => normalizeSheet(sheet), [sheet]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!norm.categories.length || !norm.trims.length) return null;

  const activeCat = norm.categories[Math.min(activeIndex, norm.categories.length - 1)];
  const activeName = catNameByLang(activeCat, lang);

  return (
    <div>
      {/* Category selector */}
      <div className="relative mb-4">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left font-semibold transition-colors hover:bg-muted"
        >
          <span>{activeName}</span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-lg border bg-popover py-1 shadow-lg">
            {norm.categories.map((cat, ci) => {
              const name = catNameByLang(cat, lang);
              return (
                <button
                  key={ci}
                  onClick={() => { setActiveIndex(ci); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted ${ci === activeIndex ? "bg-brand-600/10 font-semibold text-brand" : ""}`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active category table */}
      {activeCat && (
            <div className="overflow-auto rounded-lg border max-h-[70vh] max-w-[calc(100vw-2rem)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-brand-600 text-white">
                    <th className="sticky left-0 z-30 bg-brand-600 px-3 py-3 text-left text-sm font-semibold sm:px-4 sm:py-3.5 min-w-[120px] max-w-[160px] sm:min-w-0 sm:max-w-none">
                      {modelName || (locale === "ua" ? "Комплектація" : locale === "en" ? "Trim" : "Комплектация")}
                    </th>
                    {norm.trims.map((trim, ti) => (
                      <th key={ti} className="px-3 py-3 text-center text-sm font-semibold whitespace-nowrap sm:px-4 sm:py-3.5">
                        {withLabel(trim, norm.label)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeCat.rows.map((row, i) => {
                    const bg = i % 2 === 0 ? "bg-card" : "bg-muted";
                    return (
                      <tr key={i} className={`border-b ${bg}`}>
                        <td className={`sticky left-0 z-10 ${bg} px-3 py-2 font-medium text-foreground min-w-[120px] max-w-[160px] sm:min-w-0 sm:max-w-none sm:px-4 sm:py-2.5 border-r sm:border-r-0`}>
                          {paramByLang(row, lang)}
                        </td>
                        {norm.trims.map((_, vi) => (
                          <td key={vi} className="px-3 py-2 text-center break-words min-w-[120px] max-w-[240px] sm:px-4 sm:py-2.5">
                            <ValueCell value={valuesByLang(row, lang)[vi] || ""} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
      )}
    </div>
  );
}

export function ModelSpecsTable({ brand, model }: { brand: string; model: string }) {
  const { locale } = useLocale();
  const { spec, loading } = useModelSpecs(brand, model);

  if (loading || !spec) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-6 text-2xl font-bold">
        {locale === "ua" ? "Технічні характеристики" : "Технические характеристики"}
      </h2>
      <ModelSpecsContent sheet={spec.spec_sheet} modelName={`${spec.brand} ${spec.model}`} />
    </section>
  );
}
