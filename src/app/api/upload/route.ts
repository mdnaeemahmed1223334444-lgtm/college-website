import { NextResponse } from "next/server";
import {
  uploadFile,
  deleteUploadedFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_UPLOAD_SIZE,
} from "@/lib/storage/uploader";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "photos";

    if (!file) {
      return NextResponse.json(
        { error: "No file was selected. Please choose a file to upload." },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 10 MB maximum upload limit." },
        { status: 400 }
      );
    }

    const contentType = file.type || "application/octet-stream";
    const isImage = ALLOWED_IMAGE_TYPES.includes(contentType as (typeof ALLOWED_IMAGE_TYPES)[number]);
    const isDoc = ALLOWED_DOCUMENT_TYPES.includes(contentType as (typeof ALLOWED_DOCUMENT_TYPES)[number]);

    // Accept all standard images and documents
    if (!isImage && !isDoc && !contentType.startsWith("image/")) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Please upload an image (JPG, PNG, WebP, GIF) or document (PDF, Word).",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadFile({
      buffer,
      filename: file.name,
      contentType,
      folder,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      size: result.size,
      provider: result.provider,
      filename: file.name,
      message: "Photo uploaded and hosted successfully!",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to upload file";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    maxSizeBytes: MAX_UPLOAD_SIZE,
    allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
  });
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = body?.url;
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }
    const deleted = await deleteUploadedFile(url);
    return NextResponse.json({ success: true, deleted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete file";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
