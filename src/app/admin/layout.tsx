import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import AdminShell from "./admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();

  // Залогинен, но email не в списке доступа — на главную.
  if (!admin) {
    redirect("/?denied=1");
  }

  return (
    <AdminShell role={admin.role} permissions={admin.permissions}>
      {children}
    </AdminShell>
  );
}
