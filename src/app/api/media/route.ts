import { NextResponse } from "next/server";
import { requireAdmin, requireOwner } from "@/lib/admin-auth";
import { createSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const BUCKET = "car-images";

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.storage.from(BUCKET).list(path, {
    limit: 200,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data || []).map((item) => {
    const isFolder = !item.metadata || item.id === null;
    const fullPath = path ? `${path}/${item.name}` : item.name;
    return {
      name: item.name,
      path: fullPath,
      isFolder,
      size: item.metadata?.size || 0,
      mimeType: item.metadata?.mimetype || "",
      updatedAt: item.updated_at || "",
      url: isFolder
        ? null
        : supabase.storage.from(BUCKET).getPublicUrl(fullPath).data.publicUrl,
    };
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const gate = await requireAdmin("editContent");
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const contentType = req.headers.get("content-type") || "";
  const supabase = createSupabaseAdmin();

  if (contentType.includes("application/json")) {
    const { action, path, newName } = await req.json();

    if (action === "create-folder") {
      if (!path) {
        return NextResponse.json({ error: "Path is required" }, { status: 400 });
      }
      const placeholder = `${path}/.emptyFolderPlaceholder`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(placeholder, new Uint8Array(0), {
          contentType: "application/octet-stream",
          upsert: true,
        });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "rename") {
      if (!path || !newName) {
        return NextResponse.json({ error: "Path and newName required" }, { status: 400 });
      }
      const dir = path.split("/").slice(0, -1).join("/");
      const newPath = dir ? `${dir}/${newName}` : newName;
      const { error } = await supabase.storage.from(BUCKET).move(path, newPath);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, newPath });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  const folder = (formData.get("folder") as string) || "";

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const results = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_");
    const fileName = folder
      ? `${folder}/${Date.now()}-${safeName}`
      : `${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      results.push({ name: file.name, error: error.message });
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    results.push({
      name: file.name,
      path: data.path,
      url: urlData.publicUrl,
    });
  }

  return NextResponse.json(results);
}

export async function DELETE(req: Request) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { paths } = await req.json();
  if (!paths?.length) {
    return NextResponse.json({ error: "Paths required" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  const filePaths: string[] = [];
  for (const p of paths as string[]) {
    const { data } = await supabase.storage.from(BUCKET).list(p, { limit: 500 });
    if (data && data.length > 0) {
      const nested = data.map((f) => `${p}/${f.name}`);
      filePaths.push(...nested);
    } else {
      filePaths.push(p);
    }
  }

  const { error } = await supabase.storage.from(BUCKET).remove(filePaths);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Clean up references in car records (images, thumbnail)
  try {
    const deletedUrls = filePaths.map(
      (fp) => supabase.storage.from(BUCKET).getPublicUrl(fp).data.publicUrl
    );

    const { data: cars } = await supabase
      .from("cars")
      .select("id, images, thumbnail");

    if (cars && cars.length > 0) {
      for (const car of cars) {
        const images: string[] = car.images || [];
        const newImages = images.filter((url: string) => !deletedUrls.includes(url));
        const thumbDeleted = car.thumbnail && deletedUrls.includes(car.thumbnail);

        if (newImages.length !== images.length || thumbDeleted) {
          const updates: Record<string, unknown> = {};
          if (newImages.length !== images.length) updates.images = newImages;
          if (thumbDeleted) updates.thumbnail = newImages[0] || "";
          await supabase.from("cars").update(updates).eq("id", car.id);
        }
      }
    }
  } catch {
    // Non-critical — don't fail the delete if cleanup fails
  }

  return NextResponse.json({ success: true, deleted: filePaths.length });
}
