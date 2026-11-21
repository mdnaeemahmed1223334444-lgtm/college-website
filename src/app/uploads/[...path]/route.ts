import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const cleanSegments = pathSegments.map((s) => s.replace(/[^a-zA-Z0-9_.-]/g, ""));
    const filePath = path.join(process.cwd(), "public", "uploads", ...cleanSegments);

    // Prevent directory traversal
    const uploadsBase = path.join(process.cwd(), "public", "uploads");
    if (!filePath.startsWith(uploadsBase)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("File Not Found", { status: 404 });
  }
}
