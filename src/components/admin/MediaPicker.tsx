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
import {
  FolderPlus,
  Upload,
  Loader2,
  Folder,
  ChevronRight,
  Home,
  ImageIcon,
  ArrowLeft,
  Search,
  Check,
  CheckCheck,
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

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}

export function MediaPicker({ open, onClose, onSelect, multiple = true }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
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
  }, [currentPath]);

  useEffect(() => {
    if (open) {
      loadItems();
      setSelected([]);
    }
  }, [open, loadItems]);

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
      const res = await fetch("/api/media", { method: "POST", body: formData });
      const results = await res.json();
      if (Array.isArray(results)) {
        const newUrls = results.filter((r) => r.url).map((r) => r.url);
        if (newUrls.length > 0) {
          setSelected((prev) => [...prev, ...newUrls.filter((u: string) => !prev.includes(u))]);
        }
      }
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

  function toggleSelect(url: string) {
    setSelected((prev) => {
      if (!multiple) {
        return prev.includes(url) ? [] : [url];
      }
      if (prev.includes(url)) {
        return prev.filter((u) => u !== url);
      }
      return [...prev, url];
    });
  }

  function selectAllFiles() {
    const allFileUrls = files.filter((f) => f.url).map((f) => f.url!);
    const allSelected = allFileUrls.every((u) => selected.includes(u));
    if (allSelected) {
      setSelected((prev) => prev.filter((u) => !allFileUrls.includes(u)));
    } else {
      setSelected((prev) => [...prev, ...allFileUrls.filter((u) => !prev.includes(u))]);
    }
  }

  function handleConfirm() {
    onSelect(selected);
    onClose();
    setSelected([]);
    setCurrentPath("");
  }

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    return item.name.toLowerCase().includes(search.toLowerCase());
  });

  const folders = filteredItems.filter((i) => i.isFolder);
  const files = filteredItems.filter((i) => !i.isFolder);

  const allFilesSelected = files.length > 0 && files.filter((f) => f.url).every((f) => selected.includes(f.url!));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Обрати зображення</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b pb-3">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm">
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
                  onClick={() => navigateTo(breadcrumbs.slice(0, i + 1).join("/"))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук..."
              className="h-8 w-40 pl-7 text-sm"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setShowNewFolder(true)}
          >
            <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
            Папка
          </Button>

          <Button
            size="sm"
            className="h-8 bg-brand-600 hover:bg-brand-700"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
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

        {/* Back + Select All row */}
        <div className="flex items-center justify-between">
          <div>
            {currentPath && (
              <button
                onClick={navigateUp}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Назад
              </button>
            )}
          </div>
          {multiple && files.length > 0 && (
            <button
              onClick={selectAllFiles}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                allFilesSelected
                  ? "bg-brand-100 text-brand-700"
                  : "text-muted-foreground hover:bg-zinc-100 hover:text-foreground"
              }`}
            >
              <CheckCheck className="h-4 w-4" />
              {allFilesSelected ? "Зняти все" : "Обрати все"}
            </button>
          )}
        </div>

        {/* New folder inline */}
        {showNewFolder && (
          <form onSubmit={handleCreateFolder} className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-400" />
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Назва папки"
              className="h-8 max-w-xs text-sm"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 bg-brand-600 hover:bg-brand-700"
              disabled={creatingFolder || !newFolderName.trim()}
            >
              {creatingFolder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "OK"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => {
                setShowNewFolder(false);
                setNewFolderName("");
              }}
            >
              Скасувати
            </Button>
          </form>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search ? "Нічого не знайдено" : "Папка порожня"}
              </p>
            </div>
          ) : (
            <div>
              {/* Folders */}
              {folders.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {folders.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => navigateTo(item.path)}
                        className="flex flex-col items-center gap-1 rounded-lg border bg-white p-3 text-center transition-colors hover:bg-zinc-50"
                      >
                        <Folder className="h-8 w-8 text-blue-400" />
                        <span className="w-full truncate text-xs font-medium">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {files.map((item) => {
                    const selIndex = item.url ? selected.indexOf(item.url) : -1;
                    const isSelected = selIndex !== -1;
                    return (
                      <div
                        key={item.path}
                        onClick={() => item.url && toggleSelect(item.url)}
                        className={`group relative cursor-pointer overflow-hidden rounded-lg border transition-all ${
                          isSelected
                            ? "border-brand-500 ring-2 ring-brand-500"
                            : "hover:border-zinc-400"
                        }`}
                      >
                        <div className="absolute left-1.5 top-1.5 z-10">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                              isSelected
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-white bg-white/60 text-transparent opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {isSelected ? selIndex + 1 : ""}
                          </div>
                        </div>
                        <div className="relative aspect-square bg-zinc-100">
                          {item.url ? (
                            <Image
                              src={item.url}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <FileImage className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="px-1.5 py-1">
                          <p className="truncate text-[10px] text-muted-foreground">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">
            {selected.length > 0
              ? `Обрано: ${selected.length} зображень`
              : "Оберіть зображення"}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button
              className="bg-brand-600 hover:bg-brand-700"
              disabled={selected.length === 0}
              onClick={handleConfirm}
            >
              <Check className="mr-2 h-4 w-4" />
              Обрати ({selected.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
