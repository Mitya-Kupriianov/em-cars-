"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Loader2,
  Tags,
  Pencil,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  Settings2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface ModelTrim {
  id: string;
  name: string;
  model_id: string;
}

interface BrandModel {
  id: string;
  name: string;
  brand_id: string;
  trims?: ModelTrim[];
}

interface Brand {
  id: string;
  name: string;
  sort_order: number;
  models: BrandModel[];
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit brand dialog
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Models
  const [newModelName, setNewModelName] = useState("");
  const [addingModel, setAddingModel] = useState(false);
  const [deletingModel, setDeletingModel] = useState<string | null>(null);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editingModelName, setEditingModelName] = useState("");
  const [savingModel, setSavingModel] = useState(false);

  // Trims
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [newTrimName, setNewTrimName] = useState("");
  const [addingTrim, setAddingTrim] = useState(false);
  const [deletingTrim, setDeletingTrim] = useState<string | null>(null);
  const [editingTrimId, setEditingTrimId] = useState<string | null>(null);
  const [editingTrimName, setEditingTrimName] = useState("");
  const [savingTrim, setSavingTrim] = useState(false);

  // Confirm dialogs
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [confirmDeleteModelId, setConfirmDeleteModelId] = useState<string | null>(null);
  const [confirmDeleteTrimId, setConfirmDeleteTrimId] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    const res = await fetch("/api/brands");
    const data = await res.json();
    setBrands(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        await loadBrands();
        setNewName("");
      } else {
        const err = await res.json();
        alert(err.error || "Помилка");
      }
    } catch {
      alert("Помилка додавання");
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
      setBrands((prev) => prev.filter((b) => b.id !== id));
      if (editBrand?.id === id) setEditBrand(null);
    } catch { /* ignore */ }
    setDeleting(null);
  }

  function openEdit(brand: Brand) {
    setEditBrand(brand);
    setEditName(brand.name);
    setNewModelName("");
    setEditingModelId(null);
    setExpandedModelId(null);
    setNewTrimName("");
  }

  async function handleRenameBrand() {
    if (!editBrand || !editName.trim() || editName.trim() === editBrand.name) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editBrand.id, name: editName.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBrands((prev) => prev.map((b) => (b.id === editBrand.id ? { ...b, name: updated.name } : b)));
        setEditBrand((prev) => prev ? { ...prev, name: updated.name } : prev);
      }
    } catch { /* ignore */ }
    setSavingName(false);
  }

  // ── Model CRUD ──
  async function handleAddModel(e: React.FormEvent) {
    e.preventDefault();
    if (!editBrand || !newModelName.trim()) return;
    setAddingModel(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-model", brand_id: editBrand.id, name: newModelName.trim() }),
      });
      if (res.ok) {
        const model = await res.json();
        const newModel = { ...model, trims: [] };
        setEditBrand((prev) => prev ? { ...prev, models: [...prev.models, newModel] } : prev);
        setBrands((prev) => prev.map((b) => (b.id === editBrand.id ? { ...b, models: [...b.models, newModel] } : b)));
        setNewModelName("");
      } else {
        const err = await res.json();
        alert(err.error || "Помилка");
      }
    } catch { /* ignore */ }
    setAddingModel(false);
  }

  async function handleDeleteModel(modelId: string) {
    if (!editBrand) return;
    setDeletingModel(modelId);
    try {
      await fetch(`/api/brands?modelId=${modelId}`, { method: "DELETE" });
      const updatedModels = editBrand.models.filter((m) => m.id !== modelId);
      setEditBrand({ ...editBrand, models: updatedModels });
      setBrands((prev) => prev.map((b) => (b.id === editBrand.id ? { ...b, models: updatedModels } : b)));
      if (expandedModelId === modelId) setExpandedModelId(null);
    } catch { /* ignore */ }
    setDeletingModel(null);
  }

  async function handleRenameModel() {
    if (!editBrand || !editingModelId || !editingModelName.trim()) return;
    setSavingModel(true);
    try {
      const res = await fetch("/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename-model", id: editingModelId, name: editingModelName.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        const updatedModels = editBrand.models.map((m) => (m.id === editingModelId ? { ...m, name: updated.name } : m));
        setEditBrand({ ...editBrand, models: updatedModels });
        setBrands((prev) => prev.map((b) => (b.id === editBrand.id ? { ...b, models: updatedModels } : b)));
        setEditingModelId(null);
        setEditingModelName("");
      }
    } catch { /* ignore */ }
    setSavingModel(false);
  }

  // ── Trim CRUD ──
  async function handleAddTrim(e: React.FormEvent, modelId: string) {
    e.preventDefault();
    if (!editBrand || !newTrimName.trim()) return;
    setAddingTrim(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-trim", model_id: modelId, name: newTrimName.trim() }),
      });
      if (res.ok) {
        const trim = await res.json();
        const updatedModels = editBrand.models.map((m) =>
          m.id === modelId ? { ...m, trims: [...(m.trims || []), trim] } : m
        );
        setEditBrand({ ...editBrand, models: updatedModels });
        setBrands((prev) => prev.map((b) => (b.id === editBrand.id ? { ...b, models: updatedModels } : b)));
        setNewTrimName("");
      }
    } catch { /* ignore */ }
    setAddingTrim(false);
  }

  async function handleDeleteTrim(trimId: string, modelId: string) {
    if (!editBrand) return;
    setDeletingTrim(trimId);
    try {
      await fetch(`/api/brands?trimId=${trimId}`, { method: "DELETE" });
      const updatedModels = editBrand.models.map((m) =>
        m.id === modelId ? { ...m, trims: (m.trims || []).filter((t) => t.id !== trimId) } : m
      );
      setEditBrand({ ...editBrand, models: updatedModels });
      setBrands((prev) => prev.map((b) => (b.id === editBrand.id ? { ...b, models: updatedModels } : b)));
    } catch { /* ignore */ }
    setDeletingTrim(null);
  }

  async function handleRenameTrim() {
    if (!editBrand || !editingTrimId || !editingTrimName.trim()) return;
    setSavingTrim(true);
    try {
      const res = await fetch("/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename-trim", id: editingTrimId, name: editingTrimName.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        const updatedModels = editBrand.models.map((m) => ({
          ...m,
          trims: (m.trims || []).map((t) => (t.id === editingTrimId ? { ...t, name: updated.name } : t)),
        }));
        setEditBrand({ ...editBrand, models: updatedModels });
        setBrands((prev) => prev.map((b) => (b.id === editBrand.id ? { ...b, models: updatedModels } : b)));
        setEditingTrimId(null);
        setEditingTrimName("");
      }
    } catch { /* ignore */ }
    setSavingTrim(false);
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
      <div className="mb-2">
        <h2 className="text-2xl font-bold">Бренди ({brands.length})</h2>
        <p className="text-sm text-muted-foreground">Керуйте списком марок, моделей та комплектацій</p>
      </div>

      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Назва бренду (напр. Tesla)" className="max-w-xs" />
        <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={adding || !newName.trim()}>
          {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Додати
        </Button>
      </form>

      <div className="rounded-xl border bg-white">
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between border-b px-4 py-3 last:border-0 hover:bg-zinc-50">
            <div className="flex items-center gap-2">
              <span className="font-medium">{brand.name}</span>
              {brand.models?.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({brand.models.length} {brand.models.length === 1 ? "модель" : "моделей"})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => openEdit(brand)}>
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Редагувати
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600"
                onClick={() => setConfirmDelete({ id: brand.id, name: brand.name })}
                disabled={deleting === brand.id}
              >
                {deleting === brand.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Brand Dialog ── */}
      <Dialog open={!!editBrand} onOpenChange={(open) => { if (!open) setEditBrand(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Редагувати бренд</DialogTitle>
          </DialogHeader>

          {editBrand && (
            <div className="space-y-6">
              {/* Rename brand */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Назва бренду</label>
                <div className="flex gap-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Назва бренду" />
                  <Button onClick={handleRenameBrand} disabled={savingName || !editName.trim() || editName.trim() === editBrand.name} className="bg-brand-600 hover:bg-brand-700">
                    {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Models + Trims */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">Моделі ({editBrand.models?.length || 0})</label>

                <form onSubmit={handleAddModel} className="mb-3 flex gap-2">
                  <Input value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="Нова модель" className="text-sm" />
                  <Button type="submit" size="sm" className="h-9 bg-brand-600 hover:bg-brand-700" disabled={addingModel || !newModelName.trim()}>
                    {addingModel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                </form>

                {editBrand.models?.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">Моделей ще немає.</p>
                ) : (
                  <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border p-2">
                    {editBrand.models.map((model) => (
                      <div key={model.id}>
                        {/* Model row */}
                        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50">
                          {editingModelId === model.id ? (
                            <>
                              <Input value={editingModelName} onChange={(e) => setEditingModelName(e.target.value)} className="h-7 flex-1 text-sm" autoFocus
                                onKeyDown={(e) => { if (e.key === "Enter") handleRenameModel(); if (e.key === "Escape") { setEditingModelId(null); setEditingModelName(""); } }}
                              />
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRenameModel} disabled={savingModel}>
                                {savingModel ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingModelId(null); setEditingModelName(""); }}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* Expand trims toggle */}
                              <button
                                onClick={() => setExpandedModelId(expandedModelId === model.id ? null : model.id)}
                                className="flex items-center gap-1 flex-1 text-left text-sm"
                              >
                                {expandedModelId === model.id ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                <span>{model.name}</span>
                                {(model.trims?.length || 0) > 0 && (
                                  <span className="ml-1 text-xs text-muted-foreground">({model.trims!.length})</span>
                                )}
                              </button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => { setEditingModelId(model.id); setEditingModelName(model.name); }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600"
                                onClick={() => setConfirmDeleteModelId(model.id)} disabled={deletingModel === model.id}
                              >
                                {deletingModel === model.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Trims (expanded) */}
                        {expandedModelId === model.id && (
                          <div className="ml-6 mt-1 mb-2 rounded-lg border border-dashed bg-zinc-50/50 p-2">
                            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                              <Settings2 className="h-3 w-3" />
                              Комплектації
                            </div>

                            <form onSubmit={(e) => handleAddTrim(e, model.id)} className="mb-2 flex gap-2">
                              <Input value={newTrimName} onChange={(e) => setNewTrimName(e.target.value)} placeholder="Нова комплектація" className="h-7 text-xs" />
                              <Button type="submit" size="sm" className="h-7 bg-brand-600 hover:bg-brand-700 text-xs px-2" disabled={addingTrim || !newTrimName.trim()}>
                                {addingTrim ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                              </Button>
                            </form>

                            {(model.trims?.length || 0) === 0 ? (
                              <p className="py-2 text-center text-xs text-muted-foreground">Немає комплектацій</p>
                            ) : (
                              <div className="space-y-0.5">
                                {model.trims!.map((trim) => (
                                  <div key={trim.id} className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-white">
                                    {editingTrimId === trim.id ? (
                                      <>
                                        <Input value={editingTrimName} onChange={(e) => setEditingTrimName(e.target.value)} className="h-6 flex-1 text-xs" autoFocus
                                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameTrim(); if (e.key === "Escape") { setEditingTrimId(null); setEditingTrimName(""); } }}
                                        />
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRenameTrim} disabled={savingTrim}>
                                          {savingTrim ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Save className="h-2.5 w-2.5" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingTrimId(null); setEditingTrimName(""); }}>
                                          <X className="h-2.5 w-2.5" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <span className="flex-1 text-xs">{trim.name}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"
                                          onClick={() => { setEditingTrimId(trim.id); setEditingTrimName(trim.name); }}
                                        >
                                          <Pencil className="h-2.5 w-2.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500"
                                          onClick={() => setConfirmDeleteTrimId(trim.id)} disabled={deletingTrim === trim.id}
                                        >
                                          {deletingTrim === trim.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Trash2 className="h-2.5 w-2.5" />}
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm dialogs */}
      <ConfirmDialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete.id); }}
        title={`Видалити бренд "${confirmDelete?.name}"?`}
        description="Бренд, всі моделі та комплектації будуть видалені."
      />
      <ConfirmDialog open={!!confirmDeleteModelId} onOpenChange={(open) => { if (!open) setConfirmDeleteModelId(null); }}
        onConfirm={() => { if (confirmDeleteModelId) handleDeleteModel(confirmDeleteModelId); }}
        title="Видалити модель?"
        description="Модель та всі її комплектації будуть видалені."
      />
      <ConfirmDialog open={!!confirmDeleteTrimId} onOpenChange={(open) => { if (!open) setConfirmDeleteTrimId(null); }}
        onConfirm={() => {
          if (confirmDeleteTrimId && editBrand) {
            const model = editBrand.models.find((m) => m.trims?.some((t) => t.id === confirmDeleteTrimId));
            if (model) handleDeleteTrim(confirmDeleteTrimId, model.id);
          }
        }}
        title="Видалити комплектацію?"
        description="Комплектацію буде видалено."
      />
    </div>
  );
}
