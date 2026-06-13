"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Zap, LogIn, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, error: authError } = await signIn(email, password);

      if (authError || !user) {
        setError(authError?.message || "Невірний email або пароль");
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        localStorage.setItem("em-admin-auth", JSON.stringify({ id: "local-admin", email }));
      }

      router.push("/admin");
    } catch {
      setError("Помилка авторизації");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="light flex min-h-screen items-center justify-center bg-zinc-50 text-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950">
            <Zap className="h-6 w-6 text-brand-500" />
          </div>
          <h1 className="text-xl font-bold">Electro Motors Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Увійдіть до панелі управління</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {!isSupabaseConfigured() && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              Режим розробки. Логін: admin@electro-motors.top / admin123
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@electro-motors.top"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ваш пароль"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Вхід..." : "Увійти"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
