import "server-only";
import fs from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export interface UploadOptions {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder?: string; // e.g. "staff", "teachers", "notices", "gallery", "branding"
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  provider: "r2" | "local" | "data-url";
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `${base || "file"}-${timestamp}-${random}${ext}`;
}

export async function uploadFile({
  buffer,
  filename,
  contentType,
  folder = "general",
}: UploadOptions): Promise<UploadResult> {
  const safeName = sanitizeFilename(filename);
  const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const objectKey = `uploads/${cleanFolder}/${safeName}`;

  // 1. Check if Cloudflare R2 is configured
  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.R2_BUCKET_NAME;
  const r2PublicUrl = process.env.R2_PUBLIC_URL;

  if (r2AccountId && r2AccessKey && r2SecretKey && r2Bucket) {
    try {
      const client = new S3Client({
        region: "auto",
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKey,
          secretAccessKey: r2SecretKey,
        },
      });

      await client.send(
        new PutObjectCommand({
          Bucket: r2Bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: contentType,
        })
      );

      const url = r2PublicUrl
        ? `${r2PublicUrl.replace(/\/$/, "")}/${objectKey}`
        : `https://${r2Bucket}.r2.cloudflarestorage.com/${objectKey}`;

      return {
        url,
        key: objectKey,
        size: buffer.length,
        provider: "r2",
      };
    } catch (r2Err) {
      console.warn("Cloudflare R2 upload failed, falling back to local storage:", r2Err);
    }
  }

  // 2. Local Disk Storage (Default for local development & Node.js servers)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", cleanFolder);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${cleanFolder}/${safeName}`;
    return {
      url: publicUrl,
      key: objectKey,
      size: buffer.length,
      provider: "local",
    };
  } catch (fsErr) {
    console.warn("Local disk write failed (e.g. read-only serverless environment), falling back to Data URL:", fsErr);

    // 3. Fallback to Data URL if filesystem is read-only and no R2 is configured
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;
    return {
      url: dataUrl,
      key: objectKey,
      size: buffer.length,
      provider: "data-url",
    };
  }
}

/**
 * Automatically delete an uploaded file from local storage or R2 when it is removed
 * or replaced, so orphan/unused pictures don't take up space.
 */
export async function deleteUploadedFile(fileUrl?: string | null): Promise<boolean> {
  if (!fileUrl || typeof fileUrl !== "string") return false;

  // Ignore external URLs (e.g. Unsplash) and Data URLs
  if (fileUrl.startsWith("data:") || fileUrl.startsWith("http://") || (fileUrl.startsWith("https://") && !fileUrl.includes("r2.cloudflarestorage.com"))) {
    return false;
  }

  try {
    // 1. Delete from local disk
    if (fileUrl.startsWith("/uploads/")) {
      const relativePart = fileUrl.replace(/^\/uploads\//, "");
      const safeRelative = path.normalize(relativePart).replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(process.cwd(), "public", "uploads", safeRelative);

      try {
        await fs.unlink(fullPath);
        return true;
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (error.code !== "ENOENT") {
          console.warn(`Failed to delete local file ${fullPath}:`, err);
        }
      }
    }

    // 2. Delete from Cloudflare R2 if configured
    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2Bucket = process.env.R2_BUCKET_NAME;

    if (r2AccountId && r2AccessKey && r2SecretKey && r2Bucket) {
      let objectKey = fileUrl;
      if (fileUrl.includes("/uploads/")) {
        objectKey = "uploads/" + fileUrl.split("/uploads/")[1];
      }
      const client = new S3Client({
        region: "auto",
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKey,
          secretAccessKey: r2SecretKey,
        },
      });

      await client.send(
        new DeleteObjectCommand({
          Bucket: r2Bucket,
          Key: objectKey,
        })
      );
      return true;
    }
  } catch (err) {
    console.warn(`deleteUploadedFile failed for ${fileUrl}:`, err);
  }

  return false;
}
