import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import TeamManager from "./team-manager";

export default async function AdminTeamPage() {
  const admin = await getAdminUser();
  if (!admin || !admin.permissions.includes("manageTeam")) {
    redirect("/admin");
  }
  return <TeamManager currentEmail={admin.email} />;
}
