"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  FolderPlus,
  Upload,
  Trash2,
  Loader2,
  Folder,
  ChevronRight,
  Home,
  ImageIcon,
  Copy,
  Check,
  ArrowLeft,
  Grid3X3,
  List,
  Search,
  X,
  FileImage,
} from "lucide-react";

interface MediaItem {
  name: string;
  path: string;
  isFolder: boolean;
  size: number;
  mimeType: string;
  updatedAt: string;
  url: string | null;
}

function formatSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [confirmDeleteBulk, setConfirmDeleteBulk] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?path=${encodeURIComponent(currentPath)}`);
      const data = await res.json();
      const filtered = Array.isArray(data)
        ? data.filter((i: MediaItem) => i.name !== ".emptyFolderPlaceholder")
        : [];
      setItems(filtered);
    } catch {
      setItems([]);
    }
    setLoading(false);
    setSelected(new Set());
  }, [currentPath]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function navigateTo(path: string) {
    setCurrentPath(path);
    setSearch("");
  }

  function navigateUp() {
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    navigateTo(parts.join("/"));
  }

  const breadcrumbs = currentPath ? currentPath.split("/").filter(Boolean) : [];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }
    formData.append("folder", currentPath);

    try {
      await fetch("/api/media", { method: "POST", body: formData });
      await loadItems();
    } catch { /* ignore */ }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);

    const folderPath = currentPath
      ? `${currentPath}/${newFolderName.trim()}`
      : newFolderName.trim();

    try {
      await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-folder", path: folderPath }),
      });
      await loadItems();
    } catch { /* ignore */ }

    setNewFolderName("");
    setShowNewFolder(false);
    setCreatingFolder(false);
  }

  async function handleDelete() {
    if (!selected.size) return;
    setDeleting(true);
    try {
      await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: Array.from(selected) }),
      });
      await loadItems();
    } catch { /* ignore */ }
    setDeleting(false);
  }

  function toggleSelect(path: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filteredItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredItems.map((i) => i.path)));
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  const folders = filteredItems.filter((i) => i.isFolder);
  const files = filteredItems.filter((i) => !i.isFolder);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Медіа-менеджер</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Керуйте зображеннями для автомобілів
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewFolder(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Нова папка
          </Button>
          <Button
            size="sm"
            className="bg-brand-600 hover:bg-brand-700"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Завантажити
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        {/* Breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-lg border bg-white px-3 py-2 text-sm">
          <button
            onClick={() => navigateTo("")}
            className="flex shrink-0 items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
            car-images
          </button>
          {breadcrumbs.map((part, i) => (
            <span key={i} className="flex shrink-0 items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <button
                onClick={() =>
                  navigateTo(breadcrumbs.slice(0, i + 1).join("/"))
                }
                className="text-muted-foreground hover:text-foreground"
              >
                {part}
              </button>
            </span>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук..."
            className="h-9 w-48 pl-8 text-sm"
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-l-lg p-2 ${viewMode === "grid" ? "bg-zinc-100" : ""}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-r-lg p-2 ${viewMode === "list" ? "bg-zinc-100" : ""}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
          <span className="text-sm font-medium">
            Обрано: {selected.size}
          </span>
          <Button variant="ghost" size="sm" onClick={selectAll}>
            {selected.size === filteredItems.length ? "Зняти все" : "Обрати все"}
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => setConfirmDeleteBulk(true)}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-3.5 w-3.5" />
            )}
            Видалити
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(new Set())}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Back button */}
      {currentPath && (
        <button
          onClick={navigateUp}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-20">
          <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            {search ? "Нічого не знайдено" : "Папка порожня"}
          </p>
          <p className="text-sm text-muted-foreground">
            Завантажте зображення або створіть папку
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div>
          {/* Folders grid */}
          {folders.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Папки ({folders.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {folders.map((item) => (
                  <div
                    key={item.path}
                    className={`group relative cursor-pointer rounded-xl border bg-white p-4 text-center transition-all hover:shadow-md ${
                      selected.has(item.path)
                        ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                        : ""
                    }`}
                  >
                    <div
                      className="absolute left-2 top-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.path);
                      }}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                          selected.has(item.path)
                            ? "border-brand-600 bg-brand-600"
                            : "border-zinc-300 bg-white opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {selected.has(item.path) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div
                      onDoubleClick={() => navigateTo(item.path)}
                      onClick={() => navigateTo(item.path)}
                    >
                      <Folder className="mx-auto mb-2 h-12 w-12 text-blue-400" />
                      <p className="truncate text-sm font-medium" title={item.name}>
                        {item.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files grid */}
          {files.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Файли ({files.length})
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {files.map((item) => (
                  <div
                    key={item.path}
                    className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md ${
                      selected.has(item.path)
                        ? "border-brand-500 ring-1 ring-brand-500"
                        : ""
                    }`}
                  >
                    <div
                      className="absolute left-2 top-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.path);
                      }}
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                          selected.has(item.path)
                            ? "border-brand-600 bg-brand-600"
                            : "border-zinc-300 bg-white/80 opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {selected.has(item.path) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    {item.url && (
                      <button
                        className="absolute right-2 top-2 z-10 rounded-md bg-white/80 p-1.5 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyUrl(item.url!);
                        }}
                        title="Копіювати URL"
                      >
                        {copiedUrl === item.url ? (
                          <Check className="h-3.5 w-3.5 text-brand-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}

                    <div onClick={() => setPreviewItem(item)}>
                      <div className="relative aspect-square bg-zinc-100">
                        {item.url ? (
                          <Image
                            src={item.url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="200px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <FileImage className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-medium" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatSize(item.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List view */
        <div className="rounded-xl border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="w-8 p-3">
                  <div
                    onClick={selectAll}
                    className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border ${
                      selected.size === filteredItems.length && filteredItems.length > 0
                        ? "border-brand-600 bg-brand-600"
                        : "border-zinc-300"
                    }`}
                  >
                    {selected.size === filteredItems.length && filteredItems.length > 0 && (
                      <Check className="h-2.5 w-2.5 text-white" />
                    )}
                  </div>
                </th>
                <th className="p-3">Назва</th>
                <th className="p-3">Розмір</th>
                <th className="p-3 text-right">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.path}
                  className={`border-b last:border-0 hover:bg-zinc-50 ${
                    selected.has(item.path) ? "bg-brand-50" : ""
                  }`}
                >
                  <td className="p-3">
                    <div
                      onClick={() => toggleSelect(item.path)}
                      className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border ${
                        selected.has(item.path)
                          ? "border-brand-600 bg-brand-600"
                          : "border-zinc-300"
                      }`}
                    >
                      {selected.has(item.path) && (
                        <Check className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        item.isFolder
                          ? navigateTo(item.path)
                          : setPreviewItem(item)
                      }
                      className="flex items-center gap-3 hover:text-brand-600"
                    >
                      {item.isFolder ? (
                        <Folder className="h-5 w-5 text-blue-400" />
                      ) : item.url ? (
                        <div className="relative h-8 w-8 overflow-hidden rounded bg-zinc-100">
                          <Image
                            src={item.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      ) : (
                        <FileImage className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {item.isFolder ? "—" : formatSize(item.size)}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      {item.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyUrl(item.url!)}
                        >
                          {copiedUrl === item.url ? (
                            <Check className="h-3.5 w-3.5 text-brand-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => setConfirmDeleteItem(item.path)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Нова папка</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="flex gap-3">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Назва папки"
              autoFocus
            />
            <Button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700"
              disabled={creatingFolder || !newFolderName.trim()}
            >
              {creatingFolder ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Створити"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewItem}
        onOpenChange={() => setPreviewItem(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">
              {previewItem?.name}
            </DialogTitle>
          </DialogHeader>
          {previewItem?.url && (
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100">
                <Image
                  src={previewItem.url}
                  alt={previewItem.name}
                  fill
                  className="object-contain"
                  sizes="800px"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1 rounded-lg border bg-zinc-50 px-3 py-2">
                  <p className="truncate text-xs text-muted-foreground">
                    {previewItem.url}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyUrl(previewItem.url!)}
                >
                  {copiedUrl === previewItem.url ? (
                    <>
                      <Check className="mr-2 h-3.5 w-3.5 text-brand-600" />
                      Скопійовано
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Копіювати URL
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Розмір: {formatSize(previewItem.size)}</span>
                <span>Тип: {previewItem.mimeType}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDeleteBulk}
        onOpenChange={setConfirmDeleteBulk}
        onConfirm={handleDelete}
        title={`Видалити ${selected.size} елемент(ів)?`}
        description="Обрані файли будуть видалені назавжди. Цю дію неможливо скасувати."
      />
      <ConfirmDialog
        open={!!confirmDeleteItem}
        onOpenChange={(open) => { if (!open) setConfirmDeleteItem(null); }}
        onConfirm={() => {
          if (confirmDeleteItem) {
            setSelected(new Set([confirmDeleteItem]));
            setTimeout(() => handleDelete(), 0);
          }
        }}
        title="Видалити файл?"
        description="Файл буде видалено назавжди. Цю дію неможливо скасувати."
      />
    </div>
  );
}
