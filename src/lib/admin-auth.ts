import "server-only";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export type Role = "owner" | "editor";

// Что разрешено каждой роли. Владелец может всё; редактор — только контент.
export type Permission =
  | "editContent" // машины, бренды, характеристики, медиа (создание/изменение)
  | "delete" // удаление записей
  | "viewRequests" // заявки клиентов
  | "editBanners" // баннеры / главная
  | "manageTeam"; // управление командой

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ["editContent", "delete", "viewRequests", "editBanners", "manageTeam"],
  editor: ["editContent"],
};

const OWNER_EMAIL = (process.env.ADMIN_OWNER_EMAIL || "").trim().toLowerCase();

export function permissionsFor(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export interface AdminUser {
  email: string;
  role: Role;
  permissions: Permission[];
}

function primaryEmail(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): string | null {
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
  return (primary?.emailAddress || user.emailAddresses[0]?.emailAddress || "").toLowerCase() || null;
}

/**
 * Возвращает админ-пользователя по текущей Clerk-сессии, либо null если доступа нет.
 * Owner определяется по ADMIN_OWNER_EMAIL (всегда имеет доступ).
 * Остальные — по таблице admin_users в Supabase.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await currentUser();
  if (!user) return null;

  const email = primaryEmail(user);
  if (!email) return null;

  if (OWNER_EMAIL && email === OWNER_EMAIL) {
    return { email, role: "owner", permissions: permissionsFor("owner") };
  }

  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("admin_team")
    .select("role")
    .eq("email", email)
    .maybeSingle();

  if (!data) return null;

  const role: Role = data.role === "owner" ? "owner" : "editor";
  return { email, role, permissions: permissionsFor(role) };
}

/**
 * Защита для API-роутов. Использование:
 *   const gate = await requireAdmin("editContent");
 *   if (gate instanceof NextResponse) return gate;
 *   // gate теперь AdminUser
 */
export async function requireAdmin(permission?: Permission): Promise<AdminUser | NextResponse> {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
  }
  if (permission && !admin.permissions.includes(permission)) {
    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  }
  return admin;
}

/** Только владелец. */
export function requireOwner() {
  return requireAdmin("manageTeam");
}
