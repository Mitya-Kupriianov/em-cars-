"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, Users, ShieldCheck, Pencil } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Member {
  email: string;
  role: "owner" | "editor";
  created_at: string | null;
  isPrimaryOwner: boolean;
}

export default function TeamManager({ currentEmail }: { currentEmail: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "editor">("editor");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/team");
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function addMember() {
    setError(null);
    if (!email.trim()) return;
    setAdding(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), role }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error || "Не удалось добавить");
      return;
    }
    setEmail("");
    setRole("editor");
    load();
  }

  async function removeMember(target: string) {
    setConfirmRemove(null);
    const res = await fetch(`/api/team?email=${encodeURIComponent(target)}`, { method: "DELETE" });
    if (res.ok) load();
    else {
      const data = await res.json();
      setError(data.error || "Не удалось удалить");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-1 flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Команда</h2>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Доступ в админку получают только добавленные сюда email. Редактор может только
        добавлять и менять контент (машины, бренды, характеристики, медиа). Владелец может всё.
      </p>

      {/* Форма добавления */}
      <div className="mb-6 rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label>
            <Input
              type="email"
              placeholder="person@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "owner" | "editor")}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            >
              <option value="editor">Редактор</option>
              <option value="owner">Владелец</option>
            </select>
          </div>
          <Button onClick={addMember} disabled={adding || !email.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Добавить
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Список */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="divide-y rounded-xl border bg-card">
          {members.map((m) => (
            <div key={m.email} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {m.role === "owner" ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Pencil className="h-4 w-4 text-zinc-400" />
                )}
                <div>
                  <div className="text-sm font-medium">
                    {m.email}
                    {m.email === currentEmail && (
                      <span className="ml-2 text-xs text-muted-foreground">(вы)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.role === "owner" ? "Владелец — полный доступ" : "Редактор — только контент"}
                  </div>
                </div>
              </div>
              {m.isPrimaryOwner ? (
                <span className="text-xs text-muted-foreground">главный</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setConfirmRemove(m.email)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmRemove}
        onOpenChange={(o) => !o && setConfirmRemove(null)}
        onConfirm={() => confirmRemove && removeMember(confirmRemove)}
        title="Убрать из команды?"
        description={`Пользователь ${confirmRemove ?? ""} потеряет доступ в админку.`}
        confirmLabel="Убрать"
        cancelLabel="Отмена"
      />
    </div>
  );
}
