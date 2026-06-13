"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Loader2, Upload, X, PlayCircle, FileVideo, Camera as Instagram } from "lucide-react";

interface Review {
  id?: string;
  title_ua: string;
  title_ru: string;
  title_en?: string;
  youtube_id: string;
  video_url: string;
  instagram_url: string;
  thumbnail_url: string;
  sort_order: number;
  is_active: boolean;
}

const empty = (): Review => ({
  title_ua: "",
  title_ru: "",
  title_en: "",
  youtube_id: "",
  video_url: "",
  instagram_url: "",
  thumbnail_url: "",
  sort_order: 0,
  is_active: true,
});

function extractYoutubeId(input: string): string {
  if (!input) return "";
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("?")[0];
    return url.searchParams.get("v") || input;
  } catch {
    return input;
  }
}

function normalizeInstagramUrl(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Match /p/, /reel/, /reels/, /tv/ shortcodes
  const m = trimmed.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (m) {
    const type = m[1] === "reels" ? "reel" : m[1];
    return `https://www.instagram.com/${type}/${m[2]}/`;
  }
  return trimmed;
}

type VideoSource = "youtube" | "file" | "instagram";

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState<Review | null>(null);
  const [sourceType, setSourceType] = useState<VideoSource>("youtube");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const res = await fetch("/api/reviews?admin=1");
      const d = await res.json();
      setReviews(Array.isArray(d) ? d : []);
    } catch {}
  }

  function startNew() {
    setEditing(empty());
    setSourceType("youtube");
  }

  function startEdit(r: Review) {
    setEditing({ ...r });
    setSourceType(r.instagram_url ? "instagram" : r.video_url ? "file" : "youtube");
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setUploadProgress("Завантаження...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/reviews/upload", { method: "POST", body: fd });
      const text = await res.text();
      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: `Сервер відповів: ${res.status} ${text.slice(0, 200)}` };
      }
      if (data.url && editing) {
        setEditing({ ...editing, video_url: data.url, youtube_id: "" });
      } else {
        alert("Помилка завантаження: " + (data.error || "невідома помилка"));
      }
    } catch (err: unknown) {
      alert("Помилка мережі: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);

    const payload: Review = {
      ...editing,
      youtube_id: sourceType === "youtube" ? extractYoutubeId(editing.youtube_id) : "",
      video_url: sourceType === "file" ? editing.video_url : "",
      instagram_url: sourceType === "instagram" ? normalizeInstagramUrl(editing.instagram_url) : "",
    };

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("Помилка збереження: " + (err.error || res.status));
      setSaving(false);
      return;
    }

    const saved = await res.json();
    if (editing.id) {
      setReviews((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
    } else {
      setReviews((prev) => [...prev, saved]);
    }
    setEditing(null);
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Видалити відео?")) return;
    setDeleting(id);
    const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert("Помилка видалення");
    }
    setDeleting(null);
  }

  const ytId = editing ? extractYoutubeId(editing.youtube_id) : "";
  const thumb =
    editing?.thumbnail_url ||
    (sourceType === "youtube" && ytId
      ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
      : "");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Відгуки (відео)</h2>
        <Button onClick={startNew} className="gap-2">
          <Plus className="h-4 w-4" /> Додати відео
        </Button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{editing.id ? "Редагувати" : "Нове відео"}</h3>
            <button onClick={() => setEditing(null)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Source type toggle */}
          <div className="mb-5 flex gap-2">
            <button
              onClick={() => setSourceType("youtube")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                sourceType === "youtube"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-zinc-200 text-muted-foreground hover:border-zinc-300"
              }`}
            >
              <PlayCircle className="h-4 w-4" /> YouTube
            </button>
            <button
              onClick={() => setSourceType("instagram")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                sourceType === "instagram"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-zinc-200 text-muted-foreground hover:border-zinc-300"
              }`}
            >
              <Instagram className="h-4 w-4" /> Instagram
            </button>
            <button
              onClick={() => setSourceType("file")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                sourceType === "file"
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-zinc-200 text-muted-foreground hover:border-zinc-300"
              }`}
            >
              <FileVideo className="h-4 w-4" /> Завантажити файл
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Video source input */}
            {sourceType === "youtube" ? (
              <div className="space-y-1 sm:col-span-2">
                <Label>YouTube URL або ID</Label>
                <Input
                  value={editing.youtube_id}
                  onChange={(e) => setEditing({ ...editing, youtube_id: e.target.value })}
                  placeholder="https://youtu.be/xxxxx або dQw4w9WgXcQ"
                />
              </div>
            ) : sourceType === "instagram" ? (
              <div className="space-y-1 sm:col-span-2">
                <Label>Посилання Instagram (пост або Reels)</Label>
                <Input
                  value={editing.instagram_url}
                  onChange={(e) => setEditing({ ...editing, instagram_url: e.target.value })}
                  placeholder="https://www.instagram.com/reel/XXXXXXXXX/"
                />
                <p className="text-xs text-muted-foreground">
                  Скопіюйте посилання на публікацію або Reels з Instagram
                </p>
              </div>
            ) : (
              <div className="space-y-1 sm:col-span-2">
                <Label>Відео файл (mp4, mov, webm)</Label>
                {editing.video_url ? (
                  <div className="flex items-center gap-3 rounded-lg border bg-zinc-50 px-3 py-2">
                    <FileVideo className="h-4 w-4 shrink-0 text-brand-600" />
                    <span className="flex-1 truncate text-sm text-zinc-700">{editing.video_url.split("/").pop()}</span>
                    <button
                      onClick={() => setEditing({ ...editing, video_url: "" })}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 py-8 transition-colors hover:border-brand-400 hover:bg-brand-50"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files[0];
                      if (f) handleFileUpload(f);
                    }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
                        <span className="text-sm text-muted-foreground">{uploadProgress}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-zinc-400" />
                        <span className="text-sm text-muted-foreground">Натисніть або перетягніть відео</span>
                        <span className="text-xs text-zinc-400">MP4, MOV, WebM · до 500 МБ</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/mp4,video/mov,video/quicktime,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>Своє фото-обкладинка (URL, необов'язково)</Label>
              <Input
                value={editing.thumbnail_url}
                onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label>Назва (UA)</Label>
              <Input
                value={editing.title_ua}
                onChange={(e) => setEditing({ ...editing, title_ua: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Назва (RU)</Label>
              <Input
                value={editing.title_ru}
                onChange={(e) => setEditing({ ...editing, title_ru: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Назва (EN)</Label>
              <Input
                value={editing.title_en || ""}
                onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <Switch
                checked={editing.is_active}
                onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
              />
              <Label>Активне (видно на сайті)</Label>
            </div>
          </div>

          {thumb && (
            <div className="mt-4">
              <p className="mb-1 text-xs text-muted-foreground">Прев'ю обкладинки:</p>
              <img src={thumb} alt="preview" className="h-28 rounded-lg object-cover" />
            </div>
          )}

          {sourceType === "file" && editing.video_url && (
            <div className="mt-4">
              <p className="mb-1 text-xs text-muted-foreground">Прев'ю відео:</p>
              <video src={editing.video_url} controls className="h-40 rounded-lg" />
            </div>
          )}

          {sourceType === "instagram" && editing.instagram_url && (
            <div className="mt-4">
              <p className="mb-1 text-xs text-muted-foreground">Прев'ю Instagram:</p>
              <iframe
                src={`${normalizeInstagramUrl(editing.instagram_url)}embed`}
                className="h-[480px] w-80 rounded-lg border"
                scrolling="no"
              />
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <Button
              onClick={save}
              disabled={
                saving ||
                uploading ||
                (sourceType === "youtube"
                  ? !editing.youtube_id
                  : sourceType === "instagram"
                  ? !editing.instagram_url
                  : !editing.video_url)
              }
              className="gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Зберегти
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Скасувати
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">Немає відео. Додайте перше!</p>
        )}
        {reviews.map((r) => {
          const previewThumb =
            r.thumbnail_url ||
            (r.youtube_id ? `https://img.youtube.com/vi/${r.youtube_id}/mqdefault.jpg` : "");
          const label =
            r.title_ua || r.youtube_id || r.instagram_url || r.video_url?.split("/").pop() || "—";
          const tag = r.youtube_id
            ? `YouTube: ${r.youtube_id}`
            : r.instagram_url
            ? "Instagram"
            : r.video_url
            ? "Файл"
            : "—";

          return (
            <div key={r.id} className="flex items-center gap-4 rounded-xl border bg-white p-4">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {previewThumb ? (
                  <img src={previewThumb} alt={label} className="h-full w-full object-cover" />
                ) : r.video_url ? (
                  <video src={r.video_url} className="h-full w-full object-cover" muted />
                ) : r.instagram_url ? (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileVideo className="h-6 w-6 text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {tag} · #{r.sort_order} ·{" "}
                  <span className={r.is_active ? "text-brand-600" : "text-zinc-400"}>
                    {r.is_active ? "активне" : "приховане"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                  Редагувати
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleting === r.id}
                  onClick={() => r.id && remove(r.id)}
                >
                  {deleting === r.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
