"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Loader2, GripVertical, ImageIcon, FolderOpen, Shield } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Banner {
  id?: string;
  title_ua: string;
  title_ru: string;
  subtitle_ua: string;
  subtitle_ru: string;
  image_url: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  show_button: boolean;
  show_callback: boolean;
}

const emptyBanner = (): Banner => ({
  title_ua: "",
  title_ru: "",
  subtitle_ua: "",
  subtitle_ru: "",
  image_url: "",
  link: "",
  sort_order: 0,
  is_active: true,
  show_button: true,
  show_callback: true,
});

interface DefaultBanner {
  id?: string;
  title_ua: string;
  title_ru: string;
  subtitle_ua: string;
  subtitle_ru: string;
  image_url: string;
  is_active: boolean;
  show_callback: boolean;
}

const emptyDefault = (): DefaultBanner => ({
  title_ua: "",
  title_ru: "",
  subtitle_ua: "",
  subtitle_ru: "",
  image_url: "",
  is_active: true,
  show_callback: true,
});

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [defaultBanner, setDefaultBanner] = useState<DefaultBanner>(emptyDefault());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingDefault, setSavingDefault] = useState(false);
  const [defaultSaved, setDefaultSaved] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [mediaPickerFor, setMediaPickerFor] = useState<number | "default" | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const hasActiveBanners = banners.some((b) => b.is_active && b.id);

  useEffect(() => {
    Promise.all([
      fetch("/api/banners?admin=1").then((r) => r.json()),
      fetch("/api/banners/default").then((r) => r.json()),
    ])
      .then(([bannersData, defaultData]) => {
        setBanners(Array.isArray(bannersData) ? bannersData : []);
        if (defaultData) setDefaultBanner(defaultData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateDefault(field: keyof DefaultBanner, value: string | boolean) {
    setDefaultBanner((prev) => ({ ...prev, [field]: value }));
    setDefaultSaved(false);
  }

  async function saveDefault() {
    if (!defaultBanner.image_url) {
      alert("Додайте зображення для основного банера");
      return;
    }
    setSavingDefault(true);
    try {
      const res = await fetch("/api/banners/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultBanner),
      });
      const saved = await res.json();
      if (res.ok) {
        setDefaultBanner(saved);
        setDefaultSaved(true);
      } else {
        alert(`Помилка: ${saved.error}`);
      }
    } catch {
      alert("Помилка збереження");
    } finally {
      setSavingDefault(false);
    }
  }

  function addBanner() {
    setBanners([...banners, { ...emptyBanner(), sort_order: banners.length }]);
  }

  function updateBanner(index: number, field: keyof Banner, value: string | number | boolean) {
    setBanners((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
    const banner = banners[index];
    if (banner?.id && savedIds.has(banner.id)) {
      setSavedIds((prev) => { const next = new Set(prev); next.delete(banner.id!); return next; });
    }
  }

  async function saveBanner(index: number) {
    const banner = banners[index];
    if (!banner.image_url) {
      alert("Додайте URL зображення");
      return;
    }

    setSaving(banner.id || `new-${index}`);

    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, sort_order: index }),
      });
      const saved = await res.json();
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b, i) => (i === index ? { ...saved } : b))
        );
        if (saved.id) {
          setSavedIds((prev) => new Set(prev).add(saved.id));
        }
      } else {
        alert(`Помилка: ${saved.error}`);
      }
    } catch {
      alert("Помилка збереження");
    } finally {
      setSaving(null);
    }
  }

  async function deleteBanner(index: number) {
    const banner = banners[index];
    if (banner.id) {
      await fetch(`/api/banners?id=${banner.id}`, { method: "DELETE" });
    }
    setBanners((prev) => prev.filter((_, i) => i !== index));
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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Банери (Hero слайдер)</h2>
        <Button onClick={addBanner} className="bg-brand-600 hover:bg-brand-700">
          <Plus className="mr-2 h-4 w-4" />
          Додати банер
        </Button>
      </div>

      {/* Default/Fallback Banner */}
      <div className={`rounded-xl border-2 p-6 mb-6 ${hasActiveBanners ? "border-border bg-muted opacity-60" : "border-brand-300 bg-brand-50/30"}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-lg">Основний банер (заглушка)</span>
            {hasActiveBanners ? (
              <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Не активний — є активні банери
              </span>
            ) : (
              <span className="rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
                Зараз показується
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={saveDefault}
            disabled={savingDefault}
            className={defaultSaved ? "border-brand-500 bg-brand-500 text-white hover:bg-brand-600 hover:text-white" : ""}
          >
            {savingDefault ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Save className="mr-1 h-3 w-3" />
            )}
            {defaultSaved ? "Збережено" : "Зберегти"}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div>
              <Label>Зображення</Label>
              <div className="flex gap-2">
                <Input
                  value={defaultBanner.image_url}
                  onChange={(e) => updateDefault("image_url", e.target.value)}
                  placeholder="URL або оберіть з медіатеки"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMediaPickerFor("default")}
                >
                  <FolderOpen className="mr-1.5 h-4 w-4" />
                  Обрати
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={defaultBanner.show_callback}
                onCheckedChange={(v) => updateDefault("show_callback", v)}
              />
              <Label>Кнопка «Заказать звонок»</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Заголовок (UA)</Label>
                <Input
                  value={defaultBanner.title_ua}
                  onChange={(e) => updateDefault("title_ua", e.target.value)}
                  placeholder="Заголовок українською"
                />
              </div>
              <div>
                <Label>Заголовок (RU)</Label>
                <Input
                  value={defaultBanner.title_ru}
                  onChange={(e) => updateDefault("title_ru", e.target.value)}
                  placeholder="Заголовок на русском"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Підзаголовок (UA)</Label>
                <Input
                  value={defaultBanner.subtitle_ua}
                  onChange={(e) => updateDefault("subtitle_ua", e.target.value)}
                  placeholder="Підзаголовок"
                />
              </div>
              <div>
                <Label>Підзаголовок (RU)</Label>
                <Input
                  value={defaultBanner.subtitle_ru}
                  onChange={(e) => updateDefault("subtitle_ru", e.target.value)}
                  placeholder="Подзаголовок"
                />
              </div>
            </div>
          </div>

          <div>
            {defaultBanner.image_url ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
                <img
                  src={defaultBanner.image_url}
                  alt="Default banner"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {(defaultBanner.title_ua || defaultBanner.title_ru) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 text-center text-white">
                    <p className="text-lg font-bold">{defaultBanner.title_ua || defaultBanner.title_ru}</p>
                    {(defaultBanner.subtitle_ua || defaultBanner.subtitle_ru) && (
                      <p className="mt-1 text-sm opacity-80">{defaultBanner.subtitle_ua || defaultBanner.subtitle_ru}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8" />
                  <p className="text-sm">Оберіть зображення</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Банери слайдера</h3>

      {banners.length === 0 && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Немає банерів. Додайте перший банер для слайдера.</p>
        </div>
      )}

      <div className="space-y-4">
        {banners.map((banner, index) => (
          <div key={banner.id || `new-${index}`} className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Банер #{index + 1}</span>
                {!banner.id && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    Не збережено
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Активний</Label>
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={(v) => updateBanner(index, "is_active", v)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveBanner(index)}
                  disabled={saving === (banner.id || `new-${index}`)}
                  className={banner.id && savedIds.has(banner.id) ? "border-brand-500 bg-brand-500 text-white hover:bg-brand-600 hover:text-white" : ""}
                >
                  {saving === (banner.id || `new-${index}`) ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="mr-1 h-3 w-3" />
                  )}
                  {banner.id && savedIds.has(banner.id) ? "Збережено" : "Зберегти"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmDeleteIndex(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <Label>Зображення</Label>
                  <div className="flex gap-2">
                    <Input
                      value={banner.image_url}
                      onChange={(e) => updateBanner(index, "image_url", e.target.value)}
                      placeholder="URL або оберіть з медіатеки"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMediaPickerFor(index)}
                    >
                      <FolderOpen className="mr-1.5 h-4 w-4" />
                      Обрати
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Посилання (куди веде клік)</Label>
                  <Input
                    value={banner.link}
                    onChange={(e) => updateBanner(index, "link", e.target.value)}
                    placeholder="/catalog/byd-seal-2024 або повний URL"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={banner.show_button}
                      onCheckedChange={(v) => updateBanner(index, "show_button", v)}
                    />
                    <Label>Кнопка «Подробнее»</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={banner.show_callback}
                      onCheckedChange={(v) => updateBanner(index, "show_callback", v)}
                    />
                    <Label>Кнопка «Заказать звонок»</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Заголовок (UA)</Label>
                    <Input
                      value={banner.title_ua}
                      onChange={(e) => updateBanner(index, "title_ua", e.target.value)}
                      placeholder="Заголовок українською"
                    />
                  </div>
                  <div>
                    <Label>Заголовок (RU)</Label>
                    <Input
                      value={banner.title_ru}
                      onChange={(e) => updateBanner(index, "title_ru", e.target.value)}
                      placeholder="Заголовок на русском"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Підзаголовок (UA)</Label>
                    <Input
                      value={banner.subtitle_ua}
                      onChange={(e) => updateBanner(index, "subtitle_ua", e.target.value)}
                      placeholder="Підзаголовок"
                    />
                  </div>
                  <div>
                    <Label>Підзаголовок (RU)</Label>
                    <Input
                      value={banner.subtitle_ru}
                      onChange={(e) => updateBanner(index, "subtitle_ru", e.target.value)}
                      placeholder="Подзаголовок"
                    />
                  </div>
                </div>
              </div>

              <div>
                {banner.image_url ? (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={banner.image_url}
                      alt={banner.title_ua || "Banner"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {(banner.title_ua || banner.title_ru) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 text-center text-white">
                        <p className="text-lg font-bold">{banner.title_ua || banner.title_ru}</p>
                        {(banner.subtitle_ua || banner.subtitle_ru) && (
                          <p className="mt-1 text-sm opacity-80">{banner.subtitle_ua || banner.subtitle_ru}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm">Оберіть зображення</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <MediaPicker
        open={mediaPickerFor !== null}
        onClose={() => setMediaPickerFor(null)}
        onSelect={(urls) => {
          if (mediaPickerFor !== null && urls.length > 0) {
            if (mediaPickerFor === "default") {
              updateDefault("image_url", urls[0]);
            } else {
              updateBanner(mediaPickerFor, "image_url", urls[0]);
            }
          }
          setMediaPickerFor(null);
        }}
        multiple={false}
      />
      <ConfirmDialog
        open={confirmDeleteIndex !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteIndex(null); }}
        onConfirm={() => { if (confirmDeleteIndex !== null) deleteBanner(confirmDeleteIndex); }}
        title="Видалити банер?"
        description="Банер буде видалено. Цю дію неможливо скасувати."
      />
    </div>
  );
}
