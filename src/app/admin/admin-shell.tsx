"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Car, MessageSquare, LayoutDashboard, ArrowLeft, Tags, ImageIcon, FileSpreadsheet, SlidersHorizontal, MapPin, ClipboardList, PlayCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import type { Permission, Role } from "@/lib/admin-auth";

// requires: какое право нужно, чтобы видеть пункт меню (undefined = виден всем админам)
const navItems: { href: string; label: string; icon: typeof Car; requires?: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/banners", label: "Банери", icon: SlidersHorizontal, requires: "editBanners" },
  { href: "/admin/cars", label: "Автомобілі", icon: Car },
  { href: "/admin/brands", label: "Бренди", icon: Tags },
  { href: "/admin/media", label: "Медіа", icon: ImageIcon },
  { href: "/admin/offices", label: "Офіси", icon: MapPin, requires: "manageTeam" },
  { href: "/admin/specs", label: "Характеристики", icon: ClipboardList },
  { href: "/admin/reviews", label: "Відгуки", icon: PlayCircle, requires: "manageTeam" },
  { href: "/admin/requests", label: "Заявки", icon: MessageSquare, requires: "viewRequests" },
  { href: "/admin/files", label: "Файли", icon: FileSpreadsheet, requires: "manageTeam" },
  { href: "/admin/team", label: "Команда", icon: Users, requires: "manageTeam" },
];

export default function AdminShell({
  role,
  permissions,
  children,
}: {
  role: Role;
  permissions: Permission[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => !item.requires || permissions.includes(item.requires));

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r bg-zinc-950 text-white">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
          <img src="/logo.png" alt="EM" className="h-10 w-auto brightness-0 invert" />
          <span className="font-bold">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href))
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 border-t border-zinc-800 p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                },
              }}
            />
            <div className="flex flex-col">
              <span className="text-xs text-zinc-300">Профіль</span>
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                {role === "owner" ? "Власник" : "Редактор"}
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            На сайт
          </Link>
        </div>
      </aside>

      <div className="ml-60 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-6">
          <h1 className="text-sm font-semibold text-muted-foreground">Панель управління</h1>
          <ThemeToggle />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
