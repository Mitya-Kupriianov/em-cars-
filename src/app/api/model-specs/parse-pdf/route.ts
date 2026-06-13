import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { execFile } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export async function POST(req: NextRequest) {
  const gate = await requireAdmin("editContent");
  if (gate instanceof NextResponse) return gate;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpPath = join(tmpdir(), `pdf-parse-${Date.now()}.pdf`);
    await writeFile(tmpPath, buffer);

    const jsonStr = await new Promise<string>((resolve, reject) => {
      execFile(
        "python3",
        [join(process.cwd(), "scripts/parse-pdf.py"), tmpPath],
        { maxBuffer: 1024 * 1024 * 10 },
        (err, stdout, stderr) => {
          unlink(tmpPath).catch(() => {});
          if (err) reject(new Error(stderr || err.message));
          else resolve(stdout);
        }
      );
    });

    const result = JSON.parse(jsonStr);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to parse PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
