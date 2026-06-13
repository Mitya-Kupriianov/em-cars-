"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Car, MessageSquare, LayoutDashboard, ArrowLeft, Zap, Tags, ImageIcon, FileSpreadsheet, SlidersHorizontal, MapPin, ClipboardList, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/banners", label: "Банери", icon: SlidersHorizontal },
  { href: "/admin/cars", label: "Автомобілі", icon: Car },
  { href: "/admin/brands", label: "Бренди", icon: Tags },
  { href: "/admin/media", label: "Медіа", icon: ImageIcon },
  { href: "/admin/offices", label: "Офіси", icon: MapPin },
  { href: "/admin/specs", label: "Характеристики", icon: ClipboardList },
  { href: "/admin/reviews", label: "Відгуки", icon: PlayCircle },
  { href: "/admin/requests", label: "Заявки", icon: MessageSquare },
  { href: "/admin/files", label: "Файли", icon: FileSpreadsheet },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="light flex min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r bg-zinc-950 text-white">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
          <img src="/logo.png" alt="EM" className="h-10 w-auto brightness-0 invert" />
          <span className="font-bold">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
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
            <span className="text-xs text-zinc-400">Профіль</span>
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
        <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-white px-6">
          <h1 className="text-sm font-semibold text-muted-foreground">Панель управління</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
