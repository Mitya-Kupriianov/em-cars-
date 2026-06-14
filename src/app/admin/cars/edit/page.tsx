"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { bodyTypes, carColors, carYears } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { ImageGrid } from "@/components/admin/ImageGrid";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { withLabel, normalizeSheet } from "@/lib/spec-sheet";
import { Car } from "@/types/car";

interface ModelTrim {
  id: string;
  name: string;
  model_id: string;
}

interface BrandModel {
  id: string;
  name: string;
  brand_id: string;
  model_trims?: ModelTrim[];
}

interface BrandWithModels {
  id: string;
  name: string;
  models: BrandModel[];
}

interface OfficeCity {
  city_ua: string;
  city_ru: string;
  city_en?: string;
}

const ENGLISH_ONLY = /^[a-zA-Z0-9\s\-_.,!?()/:;'"#+&%$@*=\[\]{}|\\<>~`^]*$/;

function validateEnglish(value: string): string {
  if (!value) return "";
  if (!ENGLISH_ONLY.test(value)) return "Only English characters allowed";
  return "";
}

export default function EditCarPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Завантаження...</div>}>
      <EditCarPage />
    </Suspense>
  );
}

function EditCarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");
  const [year, setYear] = useState("");
  const [bodyType, setBodyType] = useState("EV");
  const [status, setStatus] = useState("in_stock");
  const [driveType, setDriveType] = useState("FWD");
  const [color, setColor] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [priceUah, setPriceUah] = useState("");
  const [oldPriceUsd, setOldPriceUsd] = useState("");
  const [oldPriceUah, setOldPriceUah] = useState("");
  // true только после того, как пользователь сам сменил комплектацію —
  // чтобы автозаповнення не стирало завантажені характеристики при відкритті
  const [trimTouched, setTrimTouched] = useState(false);
  const [rangeKm, setRangeKm] = useState("");
  const [batteryKwh, setBatteryKwh] = useState("");
  const [powerHp, setPowerHp] = useState("");
  const [acceleration, setAcceleration] = useState("");
  const [mileageKm, setMileageKm] = useState("");
  const [descriptionUk, setDescriptionUk] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isPromo, setIsPromo] = useState(false);
  const [brands, setBrands] = useState<BrandWithModels[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specTrims, setSpecTrims] = useState<string[]>([]);
  const [specLabel, setSpecLabel] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);
  const [offices, setOffices] = useState<OfficeCity[]>([]);
  const [cityUa, setCityUa] = useState("");

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/offices")
      .then((r) => r.json())
      .then((data) => setOffices(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const selectedBrand = brands.find((b) => b.name === brand);
  const models = selectedBrand?.models || [];
  const selectedModel = models.find((m) => m.name === model);
  const brandTrims = selectedModel?.model_trims?.map((t) => t.name) || [];

  // Unique cities sourced from offices; include the car's saved city as a fallback
  // so an existing value still shows even if its office was later removed.
  const cityOptions = Array.from(
    new Map(offices.filter((o) => o.city_ua).map((o) => [o.city_ua, o])).values()
  );
  if (cityUa && !cityOptions.some((o) => o.city_ua === cityUa)) {
    cityOptions.push({ city_ua: cityUa, city_ru: cityUa });
  }
  const selectedCity = cityOptions.find((o) => o.city_ua === cityUa);

  function handleBrandChange(value: string | null) {
    if (!value) return;
    setBrand(value);
    const newBrand = brands.find((b) => b.name === value);
    const newModels = newBrand?.models || [];
    if (newModels.length > 0 && !newModels.some((m) => m.name === model)) {
      setModel("");
    }
  }

  useEffect(() => {
    if (!carId) return;
    fetch("/api/cars?admin=1")
      .then((r) => r.json())
      .then((cars: Car[]) => {
        const car = cars.find((c) => c.id === carId);
        if (!car) return;
        setBrand(car.brand);
        setModel(car.model);
        setTrim(car.trim || "");
        setYear(String(car.year));
        setBodyType(car.body_type);
        setStatus(car.status);
        setDriveType(car.drive_type);
        setColor(car.color || "");
        setCityUa(car.city_ua || "");
        setPriceUsd(String(car.price_usd));
        setPriceUah(String(car.price_uah || 0));
        setOldPriceUsd(car.old_price_usd ? String(car.old_price_usd) : "");
        setOldPriceUah(car.old_price_uah ? String(car.old_price_uah) : "");
        setRangeKm(String(car.range_km));
        setBatteryKwh(String(car.battery_kwh || ""));
        setPowerHp(String(car.power_hp || ""));
        setAcceleration(String(car.acceleration_0_100 || ""));
        setMileageKm(String(car.mileage_km || 0));
        setDescriptionUk(car.description_ua || "");
        setDescriptionRu(car.description_ru || "");
        setDescriptionEn(car.description_en || "");
        setIsVisible(car.is_visible !== false);
        setIsPromo(car.is_promo === true);
        setImages(car.images || []);
        setFeatures(car.specs?.features || []);
      })
      .finally(() => setLoading(false));
  }, [carId]);

  // Fetch spec trims for this brand/model
  useEffect(() => {
    if (!brand || !model) { setSpecTrims([]); setSpecLabel(""); return; }
    fetch(`/api/model-specs?brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then((data: { model: string; spec_sheet: { trims: string[]; label?: string } }[]) => {
        if (!Array.isArray(data)) return;
        const spec = data.find((s) => model.includes(s.model) || s.model.includes(model));
        setSpecTrims(spec?.spec_sheet?.trims || []);
        setSpecLabel(spec?.spec_sheet?.label || "");
      })
      .catch(() => { setSpecTrims([]); setSpecLabel(""); });
  }, [brand, model]);

  // Auto-fill specs when trim changes
  useEffect(() => {
    if (!trimTouched) return; // не чіпати характеристики при початковому завантаженні
    if (!brand || !trim) return;
    const hasSpec = specTrims.some((t) => t === trim);
    if (!hasSpec) {
      setRangeKm(""); setBatteryKwh(""); setPowerHp(""); setAcceleration("");
      setAutoFilled(false);
      return;
    }

    fetch(`/api/model-specs?brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then((data: { model: string; spec_sheet: unknown }[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const spec = data.find((s) => model.includes(s.model) || s.model.includes(model));
        if (!spec) return;
        const sheet = normalizeSheet(spec.spec_sheet);
        const trimIndex = sheet.trims.indexOf(trim);
        if (trimIndex < 0) return;

        let r = "", b = "", p = "", a = "", pHp = "";
        for (const cat of sheet.categories) {
          for (const row of cat.rows) {
            const pk = row.param_ua.toLowerCase();
            const pr = row.param_ru.toLowerCase();
            const param = pk + " " + pr;
            const val = row.values_ru?.[trimIndex] || row.values_ua?.[trimIndex] || "";
            if (!val || val === "—" || val === "-") continue;
            const num = val.replace(/[^\d.,]/g, "").replace(",", ".");

            // Horsepower fallback: first "(к.с.)/(л.с.)" value — used only if no primary power match
            if (!pHp && (param.includes("к.с.") || param.includes("л.с.")) && !val.includes("/")) {
              const hp = val.replace(/[^\d]/g, "");
              if (hp) pHp = hp;
            }

            if (!r && (param.includes("запас хода") || param.includes("запас ходу"))) {
              r = num;
            } else if ((param.includes("ємність") || param.includes("емкость")) && (param.includes("акумулятор") || param.includes("батаре"))) {
              const newVal = parseFloat(num) || 0;
              const oldVal = parseFloat(b) || 0;
              if (newVal > oldVal) b = num;
            } else if (!p && (
              param.includes("сумарна потужність") || param.includes("суммарная мощность") ||
              param.includes("загальна максимальна") || param.includes("общая максимальная мощность") ||
              val.includes("/") && (param.includes("потужність") || param.includes("мощность")) && !param.includes("двс") && !param.includes("електро") && !param.includes("электро") && !param.includes("заднього") && !param.includes("заднего") && !param.includes("переднього") && !param.includes("переднего")
            )) {
              const parts = val.split("/");
              p = parts.length > 1 ? parts[1].replace(/[^\d]/g, "") : val.replace(/[^\d]/g, "");
            } else if (!a && (param.includes("розгін") || param.includes("разгон") || param.includes("прискорення") || param.includes("ускорение")) && param.includes("100")) {
              a = num;
            }
          }
        }
        setRangeKm(r); setBatteryKwh(b); setPowerHp(p || pHp); setAcceleration(a);
        setAutoFilled(true);
      })
      .catch(() => {});
  }, [brand, model, trim, specTrims]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasErrors = Object.values(errors).some((e) => e !== "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasErrors) return;
    setSaving(true);

    const updates = {
      brand,
      model,
      trim,
      year: Number(year),
      price_usd: Number(priceUsd),
      price_uah: Number(priceUah) || 0,
      old_price_usd: Number(oldPriceUsd) || 0,
      old_price_uah: Number(oldPriceUah) || 0,
      range_km: Number(rangeKm),
      battery_kwh: Number(batteryKwh) || 0,
      power_hp: Number(powerHp) || 0,
      acceleration_0_100: Number(acceleration) || null,
      drive_type: driveType,
      body_type: bodyType,
      color,
      city_ua: cityUa || null,
      city_ru: selectedCity?.city_ru || cityUa || null,
      city_en: selectedCity?.city_en || null,
      mileage_km: Number(mileageKm) || 0,
      status,
      is_new: Number(mileageKm) === 0,
      is_visible: isVisible,
      is_promo: isPromo,
      description_ua: descriptionUk,
      description_ru: descriptionRu,
      description_en: descriptionEn,
      images,
      thumbnail: images[0] || "",
      specs: { features },
    };

    try {
      const res = await fetch(`/api/cars?id=${carId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        router.push("/admin/cars");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Помилка збереження: ${err.error || res.status}`);
      }
    } catch (e) {
      alert(`Помилка збереження: ${e}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/cars">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Редагувати автомобіль</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <ImageGrid images={images} onChange={setImages} />

        {/* Brand / Model / Trim */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Марка та модель</h3>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Марка</Label>
              <Select value={brand} onValueChange={handleBrandChange}>
                <SelectTrigger><SelectValue placeholder="Оберіть марку" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Модель</Label>
              {models.length > 0 ? (
                <Select value={model} onValueChange={(v) => v && setModel(v)}>
                  <SelectTrigger><SelectValue placeholder="Оберіть модель" /></SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                    {model && !models.some((m) => m.name === model) && (
                      <SelectItem value={model}>{model} (поточна)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setErrors((prev) => ({ ...prev, model: validateEnglish(e.target.value) }));
                  }}
                  required
                  className={errors.model ? "border-red-500" : ""}
                />
              )}
              {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
            </div>
            <div>
              <Label>Комплектація</Label>
              {brandTrims.length > 0 ? (
                <Select value={trim} onValueChange={(v) => { if (v) { setTrim(v); setTrimTouched(true); } }}>
                  <SelectTrigger><SelectValue placeholder="Оберіть комплектацію" /></SelectTrigger>
                  <SelectContent>
                    {brandTrims.map((t) => (
                      <SelectItem key={t} value={t}>
                        <span className={specTrims.includes(t) ? "font-bold" : ""}>{specTrims.includes(t) ? withLabel(t, specLabel) : t}</span>
                        {specTrims.includes(t) && <span className="ml-2 text-xs text-brand-600">●</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={trim}
                  onChange={(e) => {
                    setTrim(e.target.value);
                    setTrimTouched(true);
                    setErrors((prev) => ({ ...prev, trim: validateEnglish(e.target.value) }));
                  }}
                  placeholder="Premium, Basic, Sport..."
                  className={errors.trim ? "border-red-500" : ""}
                />
              )}
              {errors.trim && <p className="mt-1 text-xs text-red-500">{errors.trim}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Рік</Label>
              <Select value={year} onValueChange={(v) => v && setYear(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {carYears.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Місто</Label>
              <Select value={cityUa} onValueChange={(v) => setCityUa(!v || v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Не вказано" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Не вказано</SelectItem>
                  {cityOptions.map((o) => (
                    <SelectItem key={o.city_ua} value={o.city_ua}>{o.city_ua}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Основна інформація</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Тип двигуна</Label>
              <Select value={bodyType} onValueChange={(v) => v && setBodyType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {bodyTypes.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Колір</Label>
              <Select value={color} onValueChange={(v) => v && setColor(v)}>
                <SelectTrigger><SelectValue placeholder="Оберіть колір" /></SelectTrigger>
                <SelectContent>
                  {carColors.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">В наявності</SelectItem>
                  <SelectItem value="in_transit">В дорозі</SelectItem>
                  <SelectItem value="on_order">Під замовлення</SelectItem>
                  <SelectItem value="commission">Комісійне авто</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Привід</Label>
              <Select value={driveType} onValueChange={(v) => v && setDriveType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FWD">FWD</SelectItem>
                  <SelectItem value="RWD">RWD</SelectItem>
                  <SelectItem value="AWD">AWD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Ціна та характеристики</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Ціна (USD)</Label>
              <Input value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} type="number" required />
            </div>
            <div>
              <Label>Ціна (UAH)</Label>
              <Input value={priceUah} onChange={(e) => setPriceUah(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Стара ціна (USD) <span className="text-muted-foreground">— зачеркнута, для акції; 0 = без знижки</span></Label>
              <Input value={oldPriceUsd} onChange={(e) => setOldPriceUsd(e.target.value)} type="number" placeholder="0" />
            </div>
            <div>
              <Label>Стара ціна (UAH) <span className="text-muted-foreground">— зачеркнута, для акції; 0 = без знижки</span></Label>
              <Input value={oldPriceUah} onChange={(e) => setOldPriceUah(e.target.value)} type="number" placeholder="0" />
            </div>
            <div>
              <Label>Запас ходу (км)</Label>
              <Input value={rangeKm} onChange={(e) => setRangeKm(e.target.value)} type="number" required readOnly={autoFilled} className={autoFilled && rangeKm ? "border-brand-500 bg-brand-50" : ""} />
            </div>
            <div>
              <Label>Батарея (kWh)</Label>
              <Input value={batteryKwh} onChange={(e) => setBatteryKwh(e.target.value)} type="number" step="0.1" readOnly={autoFilled} className={autoFilled && batteryKwh ? "border-brand-500 bg-brand-50" : ""} />
            </div>
            <div>
              <Label>Потужність (к.с.)</Label>
              <Input value={powerHp} onChange={(e) => setPowerHp(e.target.value)} type="number" readOnly={autoFilled} className={autoFilled && powerHp ? "border-brand-500 bg-brand-50" : ""} />
            </div>
            <div>
              <Label>Розгін 0-100 (сек)</Label>
              <Input value={acceleration} onChange={(e) => setAcceleration(e.target.value)} type="number" step="0.1" readOnly={autoFilled} className={autoFilled && acceleration ? "border-brand-500 bg-brand-50" : ""} />
            </div>
            <div>
              <Label>Пробіг (км)</Label>
              <Input value={mileageKm} onChange={(e) => setMileageKm(e.target.value)} type="number" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Опис</h3>
          <div className="space-y-4">
            <div>
              <Label>Опис (UA)</Label>
              <Textarea value={descriptionUk} onChange={(e) => setDescriptionUk(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Textarea value={descriptionRu} onChange={(e) => setDescriptionRu(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>Опис (EN)</Label>
              <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} />
            </div>
          </div>
        </div>

        {/* Features / Equipment */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Обладнання</h3>
          <div className="mb-3 flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Додати опцію (напр. Panoramic roof)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = newFeature.trim();
                  if (v && !features.includes(v)) {
                    setFeatures([...features, v]);
                    setNewFeature("");
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const v = newFeature.trim();
                if (v && !features.includes(v)) {
                  setFeatures([...features, v]);
                  setNewFeature("");
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {features.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800"
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                    className="ml-1 text-brand-600 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {features.length === 0 && (
            <p className="text-sm text-muted-foreground">Немає доданого обладнання</p>
          )}
        </div>

        {/* Visibility */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Показувати на сайті</h3>
              <p className="text-sm text-muted-foreground">
                {isVisible
                  ? "Автомобіль відображається в каталозі та на головній сторінці"
                  : "Автомобіль збережено в базі, але не відображається на сайті"}
              </p>
            </div>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>
        </div>

        {/* Promo */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Акційна пропозиція</h3>
              <p className="text-sm text-muted-foreground">
                {isPromo
                  ? "Автомобіль бере участь в акційних пропозиціях і показується в блоці «Популярні моделі» на головній"
                  : "Автомобіль не бере участі в акційних пропозиціях"}
              </p>
            </div>
            <Switch checked={isPromo} onCheckedChange={setIsPromo} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={saving || hasErrors}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Збереження..." : "Зберегти"}
          </Button>
          <Link href="/admin/cars">
            <Button type="button" variant="outline">Скасувати</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
