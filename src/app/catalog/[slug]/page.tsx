import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getCarBySlug } from "@/lib/cars-service";
import { Car } from "@/types/car";
import CarDetailClient from "./CarDetailClient";

const BASE_URL = "https://electro-motors.top";

function carName(car: Car): string {
  return [car.brand, car.model, car.trim, car.year].filter(Boolean).join(" ");
}

function carDescription(car: Car, locale: string): string {
  const desc =
    (locale === "ru" ? car.description_ru : locale === "en" ? car.description_en : car.description_ua) ||
    car.description_ua || car.description_ru || car.description_en || "";
  if (desc) return desc.slice(0, 300);
  const parts = [
    `${carName(car)}.`,
    car.range_km ? `Запас ходу ${car.range_km} км.` : "",
    car.power_hp ? `${car.power_hp} к.с.` : "",
    car.battery_kwh ? `Батарея ${car.battery_kwh} кВт·год.` : "",
    car.price_usd ? `Ціна від $${car.price_usd.toLocaleString("en-US")}.` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) {
    return { title: "Авто не знайдено — Electro Motors" };
  }
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "ua";
  const title = `${carName(car)} — Electro Motors`;
  const description = carDescription(car, locale);
  const images = (car.images && car.images.length > 0 ? car.images : [car.thumbnail]).filter(Boolean) as string[];
  const url = `${BASE_URL}/catalog/${car.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: images.map((src) => ({ url: src })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

function availability(status: string): string {
  switch (status) {
    case "in_stock": return "https://schema.org/InStock";
    case "in_transit": return "https://schema.org/LimitedAvailability";
    case "on_order": return "https://schema.org/PreOrder";
    default: return "https://schema.org/InStock";
  }
}

function buildJsonLd(car: Car) {
  const url = `${BASE_URL}/catalog/${car.slug}`;
  const images = (car.images && car.images.length > 0 ? car.images : [car.thumbnail]).filter(Boolean);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: carName(car),
    url,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: car.year ? String(car.year) : undefined,
    image: images,
    fuelType: "Electric",
    bodyType: car.body_type || undefined,
    color: car.color || undefined,
    vehicleTransmission: car.drive_type || undefined,
  };
  if (car.range_km) {
    jsonLd.vehicleEngine = {
      "@type": "EngineSpecification",
      ...(car.power_hp ? { enginePower: { "@type": "QuantitativeValue", value: car.power_hp, unitCode: "BHP" } } : {}),
    };
  }
  if (car.mileage_km) {
    jsonLd.mileageFromOdometer = { "@type": "QuantitativeValue", value: car.mileage_km, unitCode: "KMT" };
  }
  if (car.price_usd > 0) {
    jsonLd.offers = {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: car.price_usd,
      availability: availability(car.status),
      itemCondition: car.mileage_km > 100 ? "https://schema.org/UsedCondition" : "https://schema.org/NewCondition",
    };
  }
  return jsonLd;
}

export default async function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);

  return (
    <>
      {car && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(car)).replace(/</g, "\\u003c") }}
        />
      )}
      <CarDetailClient slug={slug} />
    </>
  );
}
