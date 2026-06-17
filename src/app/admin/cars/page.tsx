"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Loader2, Search, Eye, EyeOff, ArchiveRestore, Archive, Percent } from "lucide-react";
import { Car } from "@/types/car";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CarImage } from "@/components/ui/car-image";

type Tab = "active" | "archived";

export default function AdminCarsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [cars, setCars] = useState<Car[]>([]);
  const [archivedCars, setArchivedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [togglingPromo, setTogglingPromo] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Confirm dialogs
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [confirmPermanentId, setConfirmPermanentId] = useState<string | null>(null);

  useEffect(() => {
    loadCars();
  }, []);

  async function loadCars() {
    setLoading(true);
    const [activeRes, archivedRes] = await Promise.all([
      fetch("/api/cars?admin=1"),
      fetch("/api/cars?admin=1&archived=1"),
    ]);
    const activeData = await activeRes.json();
    const archivedData = await archivedRes.json();

    const activeList: Car[] = Array.isArray(activeData) ? activeData : [];
    activeList.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
    setCars(activeList);

    const archivedList: Car[] = Array.isArray(archivedData) ? archivedData : [];
    archivedList.sort((a, b) => {
      // Sort by archived_at desc (newest first)
      const aDate = a.archived_at || "";
      const bDate = b.archived_at || "";
      return bDate.localeCompare(aDate);
    });
    setArchivedCars(archivedList);

    setLoading(false);
  }

  // Soft delete → archive
  async function handleArchive(id: string) {
    setDeleting(id);
    await fetch(`/api/cars?id=${id}`, { method: "DELETE" });
    const car = cars.find((c) => c.id === id);
    setCars((prev) => prev.filter((c) => c.id !== id));
    if (car) {
      setArchivedCars((prev) => [{ ...car, archived_at: new Date().toISOString() }, ...prev]);
    }
    setDeleting(null);
  }

  // Restore from archive
  async function handleRestore(id: string) {
    setRestoring(id);
    await fetch(`/api/cars?id=${id}&restore=1`, { method: "DELETE" });
    const car = archivedCars.find((c) => c.id === id);
    setArchivedCars((prev) => prev.filter((c) => c.id !== id));
    if (car) {
      setCars((prev) => {
        const updated = [...prev, { ...car, archived_at: null }];
        updated.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
        return updated;
      });
    }
    setRestoring(null);
  }

  // Permanent delete
  async function handlePermanentDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/cars?id=${id}&permanent=1`, { method: "DELETE" });
    setArchivedCars((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  async function handleToggleVisibility(car: Car) {
    setToggling(car.id);
    const newValue = !(car.is_visible !== false);
    try {
      await fetch(`/api/cars?id=${car.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: newValue }),
      });
      setCars((prev) =>
        prev.map((c) => (c.id === car.id ? { ...c, is_visible: newValue } : c))
      );
    } catch { /* ignore */ }
    setToggling(null);
  }

  async function handleTogglePromo(car: Car) {
    setTogglingPromo(car.id);
    const newValue = !(car.is_promo === true);
    try {
      await fetch(`/api/cars?id=${car.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_promo: newValue }),
      });
      setCars((prev) =>
        prev.map((c) => (c.id === car.id ? { ...c, is_promo: newValue } : c))
      );
    } catch { /* ignore */ }
    setTogglingPromo(null);
  }

  const statusColor: Record<string, string> = {
    in_stock: "bg-emerald-500 text-white",
    in_transit: "bg-blue-500 text-white",
    on_order: "bg-amber-500 text-white",
    commission: "bg-pink-200 text-pink-900",
  };

  const statusLabel: Record<string, string> = {
    in_stock: "В наявності",
    in_transit: "В дорозі",
    on_order: "Під замовлення",
    commission: "Комісійне авто",
  };

  function filterBySearch(list: Car[]) {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (car) =>
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.slug.toLowerCase().includes(q) ||
        String(car.price_usd).includes(q) ||
        String(car.year).includes(q)
    );
  }

  function formatArchivedDate(dateStr: string | null) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const filteredActive = filterBySearch(cars);
  const filteredArchived = filterBySearch(archivedCars);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Автомобілі ({tab === "active" ? cars.length : archivedCars.length})
        </h2>
        {tab === "active" && (
          <Link href="/admin/cars/new">
            <Button className="bg-brand-600 hover:bg-brand-700">
              <Plus className="mr-2 h-4 w-4" />
              Додати авто
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border bg-muted p-1">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "active"
              ? "bg-card shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Активні ({cars.length})
        </button>
        <button
          onClick={() => setTab("archived")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "archived"
              ? "bg-card shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive className="mr-1.5 inline h-3.5 w-3.5" />
          Архів ({archivedCars.length})
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук за маркою, моделлю, slug..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tab === "active" ? (
        /* ── Active cars table ── */
        <div className="rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="p-4">Фото</th>
                  <th className="p-4">Назва</th>
                  <th className="p-4">Ціна</th>
                  <th className="p-4">Стан</th>
                  <th className="p-4">Акційне</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4">На сайті</th>
                  <th className="p-4">Рік</th>
                  <th className="p-4 text-right">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredActive.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-muted-foreground">
                      {search ? "Нічого не знайдено" : "Немає автомобілів"}
                    </td>
                  </tr>
                ) : filteredActive.map((car) => (
                  <tr key={car.id} className="border-b last:border-0 hover:bg-muted">
                    <td className="p-4">
                      <div className="relative h-12 w-20 overflow-hidden rounded-md bg-muted">
                        <CarImage
                          src={car.thumbnail || ""}
                          alt={car.model}
                          fill
                          className="object-cover"
                          sizes="80px"
                          fallbackText=""
                          preloadAhead={false}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {car.brand} {car.model}{car.trim ? ` ${car.trim}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">{car.slug}</div>
                    </td>
                    <td className="p-4 font-semibold">${car.price_usd.toLocaleString()}</td>
                    <td className="p-4">
                      {car.mileage_km > 100 ? (
                        <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                          З пробігом · {car.mileage_km.toLocaleString()} км
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-brand-600 border-brand-300 bg-brand-50">
                          Нове
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePromo(car)}
                        disabled={togglingPromo === car.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          car.is_promo
                            ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {togglingPromo === car.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Percent className="h-3 w-3" />
                        )}
                        {car.is_promo ? "Акція" : "—"}
                      </button>
                    </td>
                    <td className="p-4">
                      <Badge className={`${statusColor[car.status]} border-0`}>
                        {statusLabel[car.status]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVisibility(car)}
                        disabled={toggling === car.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          car.is_visible !== false
                            ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {toggling === car.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : car.is_visible !== false ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                        {car.is_visible !== false ? "Увімк." : "Вимк."}
                      </button>
                    </td>
                    <td className="p-4">{car.year}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/cars/edit?id=${car.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => setConfirmArchiveId(car.id)}
                          disabled={deleting === car.id}
                        >
                          {deleting === car.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Archived cars table ── */
        <div className="rounded-xl border bg-card">
          {filteredArchived.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Archive className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {search ? "Нічого не знайдено" : "Архів порожній"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4">Фото</th>
                    <th className="p-4">Назва</th>
                    <th className="p-4">Ціна</th>
                    <th className="p-4">Видалено</th>
                    <th className="p-4 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArchived.map((car) => (
                    <tr key={car.id} className="border-b last:border-0 hover:bg-muted">
                      <td className="p-4">
                        <div className="relative h-12 w-20 overflow-hidden rounded-md bg-muted opacity-60">
                          <CarImage
                            src={car.thumbnail || ""}
                            alt={car.model}
                            fill
                            className="object-cover"
                            sizes="80px"
                            fallbackText=""
                            preloadAhead={false}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-muted-foreground">
                          {car.brand} {car.model}{car.trim ? ` ${car.trim}` : ""}
                        </div>
                        <div className="text-xs text-muted-foreground">{car.slug}</div>
                      </td>
                      <td className="p-4 font-semibold text-muted-foreground">
                        ${car.price_usd.toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatArchivedDate(car.archived_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-brand-600 hover:bg-brand-50"
                            onClick={() => handleRestore(car.id)}
                            disabled={restoring === car.id}
                          >
                            {restoring === car.id ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ArchiveRestore className="mr-1 h-3.5 w-3.5" />
                            )}
                            Відновити
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setConfirmPermanentId(car.id)}
                            disabled={deleting === car.id}
                          >
                            {deleting === car.id ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                            )}
                            Видалити
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm: archive (soft delete) */}
      <ConfirmDialog
        open={!!confirmArchiveId}
        onOpenChange={(open) => { if (!open) setConfirmArchiveId(null); }}
        onConfirm={() => { if (confirmArchiveId) handleArchive(confirmArchiveId); }}
        title="Видалити автомобіль?"
        description="Автомобіль буде переміщено до архіву. Ви зможете відновити його пізніше."
        confirmLabel="В архів"
        variant="warning"
      />

      {/* Confirm: permanent delete */}
      <ConfirmDialog
        open={!!confirmPermanentId}
        onOpenChange={(open) => { if (!open) setConfirmPermanentId(null); }}
        onConfirm={() => { if (confirmPermanentId) handlePermanentDelete(confirmPermanentId); }}
        title="Видалити назавжди?"
        description="Автомобіль буде видалено назавжди. Цю дію неможливо скасувати."
      />
    </div>
  );
}
