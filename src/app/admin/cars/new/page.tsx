"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { bodyTypes, carColors, carYears } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { ImageGrid } from "@/components/admin/ImageGrid";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import { withLabel, normalizeSheet } from "@/lib/spec-sheet";
import Link from "next/link";

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

interface Brand {
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

export default function NewCarPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [trim, setTrim] = useState("");
  const [year, setYear] = useState("2025");
  const [bodyType, setBodyType] = useState("EV");
  const [status, setStatus] = useState("on_order");
  const [color, setColor] = useState("—");
  const [driveType, setDriveType] = useState("FWD");
  const [isVisible, setIsVisible] = useState(true);
  const [isPromo, setIsPromo] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [rangeKm, setRangeKm] = useState("");
  const [batteryKwh, setBatteryKwh] = useState("");
  const [powerHp, setPowerHp] = useState("");
  const [acceleration, setAcceleration] = useState("");
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

  // Unique cities sourced from offices (updates whenever offices change)
  const cityOptions = Array.from(
    new Map(offices.filter((o) => o.city_ua).map((o) => [o.city_ua, o])).values()
  );
  const selectedCity = cityOptions.find((o) => o.city_ua === cityUa);

  const selectedBrand = brands.find((b) => b.name === brand);
  const models = selectedBrand?.models || [];
  const selectedModel = models.find((m) => m.name === model);
  const brandTrims = selectedModel?.model_trims?.map((t) => t.name) || [];

  function handleBrandChange(value: string | null) {
    if (!value) return;
    setBrand(value);
    setModel("");
  }

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
    if (!brand || !trim) return;
    const hasSpec = specTrims.some((t) => t === trim);
    if (!hasSpec) {
      // Trim has no specs — clear fields
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

            // Range: "Запас ходу/хода (CLTC)"
            if (!r && (param.includes("запас хода") || param.includes("запас ходу"))) {
              r = num;
            }
            // Battery: "Ємність акумулятора/батареї" or "Емкость аккумулятора/батареи" — take the largest value
            else if ((param.includes("ємність") || param.includes("емкость")) && (param.includes("акумулятор") || param.includes("батаре"))) {
              const newVal = parseFloat(num) || 0;
              const oldVal = parseFloat(b) || 0;
              if (newVal > oldVal) b = num;
            }
            // Power: only "Сумарна потужність" / "Суммарная мощность" / "Загальна максимальна" / contains "кВт/л.с."
            else if (!p && (
              param.includes("сумарна потужність") || param.includes("суммарная мощность") ||
              param.includes("загальна максимальна") || param.includes("общая максимальная мощность") ||
              val.includes("/")  && (param.includes("потужність") || param.includes("мощность")) && !param.includes("двс") && !param.includes("електро") && !param.includes("электро") && !param.includes("заднього") && !param.includes("заднего") && !param.includes("переднього") && !param.includes("переднего")
            )) {
              const parts = val.split("/");
              p = parts.length > 1 ? parts[1].replace(/[^\d]/g, "") : val.replace(/[^\d]/g, "");
            }
            // Acceleration: "Розгін/Разгон/Прискорення 0-100"
            else if (!a && (param.includes("розгін") || param.includes("разгон") || param.includes("прискорення") || param.includes("ускорение")) && param.includes("100")) {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hasErrors) return;
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    const car = {
      brand,
      model: model || formData.get("model_custom") || "",
      trim,
      year: Number(year),
      price_usd: Number(formData.get("price_usd")),
      price_uah: Number(formData.get("price_uah")) || 0,
      range_km: Number(rangeKm) || 0,
      battery_kwh: Number(batteryKwh) || 0,
      power_hp: Number(powerHp) || 0,
      acceleration_0_100: Number(acceleration) || null,
      drive_type: driveType,
      body_type: bodyType,
      color,
      // Only touch city columns when a city is actually chosen, so creating a
      // car keeps working even before the city migration is applied.
      ...(cityUa && {
        city_ua: cityUa,
        city_ru: selectedCity?.city_ru || cityUa,
        city_en: selectedCity?.city_en || null,
      }),
      mileage_km: Number(formData.get("mileage_km")) || 0,
      status,
      is_new: Number(formData.get("mileage_km")) === 0,
      is_visible: isVisible,
      is_promo: isPromo,
      description_ua: formData.get("description_ua") || "",
      description_ru: formData.get("description_ru") || "",
      description_en: formData.get("description_en") || "",
      images,
      thumbnail: images[0] || "",
      specs: { features },
    };

    try {
      await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      });
      router.push("/admin/cars");
    } catch {
      alert("Помилка збереження");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/cars">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">Додати автомобіль</h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <ImageGrid images={images} onChange={setImages} />

        {/* Brand / Model / Trim */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold">Марка та модель</h3>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Марка</Label>
              <Select value={brand} onValueChange={handleBrandChange} required>
                <SelectTrigger><SelectValue placeholder="Оберіть марку" /></SelectTrigger>
                <SelectContent className="light">
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Модель</Label>
              {models.length > 0 ? (
                <Select value={model} onValueChange={(v) => v && setModel(v)} required>
                  <SelectTrigger><SelectValue placeholder="Оберіть модель" /></SelectTrigger>
                  <SelectContent className="light">
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  name="model_custom"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setErrors((prev) => ({ ...prev, model: validateEnglish(e.target.value) }));
                  }}
                  placeholder={brand ? "Enter model" : "Select brand first"}
                  required
                  className={errors.model ? "border-red-500" : ""}
                />
              )}
              {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
            </div>
            <div>
              <Label>Комплектація</Label>
              {brandTrims.length > 0 ? (
                <Select value={trim} onValueChange={(v) => v && setTrim(v)}>
                  <SelectTrigger><SelectValue placeholder="Оберіть комплектацію" /></SelectTrigger>
                  <SelectContent className="light">
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
                <SelectContent className="light">
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
                <SelectContent className="light">
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
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold">Основна інформація</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Тип двигуна</Label>
              <Select value={bodyType} onValueChange={(v) => setBodyType(v || "EV")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="light">
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
                <SelectContent className="light">
                  {carColors.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={status} onValueChange={(v) => setStatus(v || "in_stock")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="light">
                  <SelectItem value="in_stock">В наявності</SelectItem>
                  <SelectItem value="in_transit">В дорозі</SelectItem>
                  <SelectItem value="on_order">Під замовлення</SelectItem>
                  <SelectItem value="commission">Комісійне авто</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Привід</Label>
              <Select value={driveType} onValueChange={(v) => setDriveType(v || "FWD")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="light">
                  <SelectItem value="FWD">FWD</SelectItem>
                  <SelectItem value="RWD">RWD</SelectItem>
                  <SelectItem value="AWD">AWD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold">Ціна та характеристики</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Ціна (USD)</Label>
              <Input name="price_usd" type="number" placeholder="26000" required />
            </div>
            <div>
              <Label>Ціна (UAH)</Label>
              <Input name="price_uah" type="number" placeholder="1073000" />
            </div>
            <div>
              <Label>Запас ходу (км)</Label>
              <Input name="range_km" type="number" placeholder="505" required value={rangeKm} onChange={(e) => setRangeKm(e.target.value)} readOnly={autoFilled} className={autoFilled && rangeKm ? "border-brand-500 bg-brand-50" : ""} />
            </div>
            <div>
              <Label>Батарея (kWh)</Label>
              <Input name="battery_kwh" type="number" step="0.1" placeholder="71.8" value={batteryKwh} onChange={(e) => setBatteryKwh(e.target.value)} readOnly={autoFilled} className={autoFilled && batteryKwh ? "border-brand-500 bg-brand-50" : ""} />
            </div>
            <div>
              <Label>Потужність (к.с.)</Label>
              <Input name="power_hp" type="number" placeholder="184" value={powerHp} onChange={(e) => setPowerHp(e.target.value)} readOnly={autoFilled} className={autoFilled && powerHp ? "border-brand-500 bg-brand-50" : ""} />
            </div>
            <div>
              <Label>Розгін 0-100 (сек)</Label>
              <Input name="acceleration" type="number" step="0.1" placeholder="8.5" value={acceleration} onChange={(e) => setAcceleration(e.target.value)} readOnly={autoFilled} className={autoFilled && acceleration ? "border-brand-500 bg-brand-50" : ""} />
            </div>
            <div>
              <Label>Пробіг (км)</Label>
              <Input name="mileage_km" type="number" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold">Опис</h3>
          <div className="space-y-4">
            <div>
              <Label>Опис (UA)</Label>
              <Textarea name="description_ua" rows={3} placeholder="Опис українською..." />
            </div>
            <div>
              <Label>Опис (RU)</Label>
              <Textarea name="description_ru" rows={3} placeholder="Описание на русском..." />
            </div>
            <div>
              <Label>Опис (EN)</Label>
              <Textarea name="description_en" rows={3} placeholder="Description in English..." />
            </div>
          </div>
        </div>

        {/* Features / Equipment */}
        <div className="rounded-xl border bg-white p-6">
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
        <div className="rounded-xl border bg-white p-6">
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
        <div className="rounded-xl border bg-white p-6">
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
