import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin-auth";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export async function POST() {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = createSupabaseAdmin();

  // Try to add archived_at column by updating a non-existent row
  // This will tell us if the column exists
  const { error: testError } = await supabase
    .from("cars")
    .select("archived_at")
    .limit(1);

  if (testError && testError.code === "42703") {
    // Column doesn't exist — we need to add it via SQL
    // Use the Supabase Management API
    return NextResponse.json({
      error: "Column 'archived_at' does not exist. Please run this SQL in Supabase Dashboard → SQL Editor:",
      sql: "ALTER TABLE cars ADD COLUMN archived_at timestamptz DEFAULT NULL;",
    }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Column archived_at already exists" });
}
