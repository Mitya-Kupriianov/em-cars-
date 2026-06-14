import { createSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import { initialCars } from "./data";
import { Car, CarFilter } from "@/types/car";

export async function getCars(filters?: CarFilter, adminMode = false, archived = false): Promise<Car[]> {
  if (!isSupabaseConfigured()) {
    return filterCarsLocal(initialCars, filters, adminMode);
  }

  const supabase = createSupabaseAdmin();

  function buildQuery(useVisibility: boolean) {
    let q = supabase.from("cars").select("*");
    if (archived) {
      q = q.not("archived_at", "is", null);
    } else {
      q = q.is("archived_at", null);
    }
    if (!adminMode && useVisibility) q = q.eq("is_visible", true);
    if (filters?.brand) q = q.eq("brand", filters.brand);
    if (filters?.model) q = q.eq("model", filters.model);
    if (filters?.bodyType) q = q.eq("body_type", filters.bodyType);
    if (filters?.status) q = q.eq("status", filters.status);
    if (filters?.minPrice) q = q.gte("price_usd", filters.minPrice);
    if (filters?.maxPrice && filters.maxPrice < 100000) q = q.lte("price_usd", filters.maxPrice);
    if (filters?.search) {
      // Вырезаем метасимволы PostgREST-фильтра (запятые, скобки, кавычки,
      // wildcard-символы), чтобы пользовательский ввод нельзя было превратить
      // в дополнительные условия фильтра.
      const safe = filters.search.replace(/[,()%*\\"`]/g, " ").trim();
      if (safe) {
        q = q.or(`brand.ilike.%${safe}%,model.ilike.%${safe}%`);
      }
    }
    switch (filters?.sort) {
      case "price_asc": q = q.order("price_usd", { ascending: true }); break;
      case "price_desc": q = q.order("price_usd", { ascending: false }); break;
      case "year_desc": q = q.order("year", { ascending: false }); break;
      case "range_desc": q = q.order("range_km", { ascending: false }); break;
      default: q = q.order("brand", { ascending: true }).order("model", { ascending: true });
    }
    return q;
  }

  let { data, error } = await buildQuery(true);

  if (error && error.code === "42703") {
    ({ data, error } = await buildQuery(false));
    if (!error && data && !adminMode) {
      data = data.filter((c: Car) => (c as unknown as Record<string, unknown>).is_visible !== false);
    }
  }

  if (error) {
    console.error("Error fetching cars:", error.message, error.code, error.details, error.hint);
    return filterCarsLocal(initialCars, filters, adminMode);
  }
  return data as Car[];
}

export async function getCarBySlug(slug: string): Promise<Car | null> {
  if (!isSupabaseConfigured()) {
    return initialCars.find((c) => c.slug === slug) || null;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return initialCars.find((c) => c.slug === slug) || null;
  }
  return data as Car;
}

/** Extract the column name from a Postgres "undefined column" (42703) error. */
export function missingColumnFromError(error: { code?: string; message?: string } | null): string | null {
  if (!error || error.code !== "42703") return null;
  const m = error.message?.match(/column "([^"]+)"/);
  return m?.[1] ?? null;
}

export async function createCar(car: Partial<Car>): Promise<Car | null> {
  const supabase = createSupabaseAdmin();
  const slug = generateSlug(car.brand || "", car.model || "", car.trim || "", car.year || 2024);

  // Retry while the DB is missing optional columns (e.g. a migration not yet run),
  // dropping the offending column each time instead of failing the whole insert.
  const payload: Record<string, unknown> = { ...car, slug };
  for (let i = 0; i < 6; i++) {
    const { data, error } = await supabase.from("cars").insert(payload).select().single();
    if (!error) return data as Car;
    const col = missingColumnFromError(error);
    if (!col || !(col in payload)) {
      console.error("Error creating car:", error);
      return null;
    }
    delete payload[col];
  }
  return null;
}

export async function updateCar(id: string, updates: Partial<Car>): Promise<Car | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("cars")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating car:", error);
    return null;
  }
  return data as Car;
}

export async function deleteCar(id: string): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("cars").delete().eq("id", id);
  return !error;
}

function generateSlug(brand: string, model: string, trim: string, year: number): string {
  const parts = [brand, model, trim, String(year)].filter(Boolean);
  const base = parts.join("-")
    .toLowerCase()
    .replace(/[^a-zа-яёіїєґ0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${base}-${suffix}`;
}

function filterCarsLocal(cars: Car[], filters?: CarFilter, adminMode = false): Car[] {
  let result = adminMode ? [...cars] : cars.filter((c) => c.is_visible !== false);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) => c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
    );
  }
  if (filters?.brand) result = result.filter((c) => c.brand === filters.brand);
  if (filters?.model) result = result.filter((c) => c.model === filters.model);
  if (filters?.bodyType) result = result.filter((c) => c.body_type === filters.bodyType);
  if (filters?.status) result = result.filter((c) => c.status === filters.status);
  if (filters?.minPrice) result = result.filter((c) => c.price_usd >= filters.minPrice!);
  if (filters?.maxPrice && filters.maxPrice < 100000)
    result = result.filter((c) => c.price_usd <= filters.maxPrice!);

  const statusOrder: Record<string, number> = { in_stock: 0, in_transit: 1, on_order: 2 };

  switch (filters?.sort) {
    case "price_asc": result.sort((a, b) => a.price_usd - b.price_usd); break;
    case "price_desc": result.sort((a, b) => b.price_usd - a.price_usd); break;
    case "year_desc": result.sort((a, b) => b.year - a.year); break;
    case "range_desc": result.sort((a, b) => b.range_km - a.range_km); break;
    default:
      result.sort((a, b) =>
        a.brand.localeCompare(b.brand)
        || a.model.localeCompare(b.model)
      );
      break;
  }

  return result;
}
