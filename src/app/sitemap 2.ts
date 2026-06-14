import type { MetadataRoute } from "next";
import { getCars } from "@/lib/cars-service";

const BASE_URL = "https://electro-motors.top";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/catalog",
    "/about",
    "/contacts",
    "/compare",
    "/faq",
    "/service",
    "/charging",
    "/financing",
    "/test-drive",
    "/trade-in",
  ];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/catalog" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/catalog" ? 0.9 : 0.6,
  }));

  // Dynamic car detail pages (best-effort — never fail the build).
  try {
    const cars = await getCars();
    for (const car of cars) {
      if (!car.slug) continue;
      entries.push({
        url: `${BASE_URL}/catalog/${car.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Supabase unavailable at build time — ship the static sitemap.
  }

  return entries;
}
