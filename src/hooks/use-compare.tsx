"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "em_compare";
const CATALOG_URL_KEY = "em_catalog_url";

interface SpecModel {
  brand: string;
  model: string;
}

interface CompareContextValue {
  items: string[]; // car ids
  count: number;
  max: number;
  isFull: boolean;
  hydrated: boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  /** Whether a car's model has a detailed spec sheet (model_specs). */
  hasSpecs: (brand: string, model: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [specModels, setSpecModels] = useState<SpecModel[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter((x) => typeof x === "string").slice(0, MAX_COMPARE));
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, hydrated]);

  // Sync across tabs/windows
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setItems(parsed);
        } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Load the set of models that have detailed spec sheets
  useEffect(() => {
    fetch("/api/model-specs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSpecModels(data.map((s: SpecModel) => ({ brand: s.brand, model: s.model })));
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

  const add = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) || prev.length >= MAX_COMPARE ? prev : [...prev, id]));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id],
    );
  }, []);

  const has = useCallback((id: string) => items.includes(id), [items]);
  const clear = useCallback(() => setItems([]), []);

  const hasSpecs = useCallback(
    (brand: string, model: string) => {
      if (!brand || !model) return false;
      const b = brand.toLowerCase();
      const m = model.toLowerCase();
      return specModels.some((s) => {
        if (!s.brand || !s.model) return false;
        if (s.brand.toLowerCase() !== b) return false;
        const sm = s.model.toLowerCase();
        return m === sm || m.startsWith(sm) || m.includes(sm) || sm.includes(m);
      });
    },
    [specModels],
  );

  return (
    <CompareContext.Provider
      value={{
        items,
        count: items.length,
        max: MAX_COMPARE,
        isFull: items.length >= MAX_COMPARE,
        hydrated,
        add,
        remove,
        toggle,
        has,
        clear,
        hasSpecs,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
}

// --- Catalog URL memory (used by the "back to catalog" button on /compare) ---
export function rememberCatalogUrl(url: string) {
  try { localStorage.setItem(CATALOG_URL_KEY, url); } catch { /* ignore */ }
}
export function getRememberedCatalogUrl(): string {
  try { return localStorage.getItem(CATALOG_URL_KEY) || "/catalog"; } catch { return "/catalog"; }
}
