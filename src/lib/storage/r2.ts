import "server-only";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@/config/env";

/**
 * Cloudflare R2 helpers (S3-compatible).
 *
 * Key convention (folder = visibility):
 *   public/gallery/<albumId>/<file>      -> public, served via R2_PUBLIC_URL
 *   public/site/<file>                   -> public site images (banners etc.)
 *   private/students/<studentId>/<file>  -> private, served via short-lived signed URL
 *   private/teachers/<teacherId>/<file>  -> private, served via short-lived signed URL
 */
let client: S3Client | null = null;

function r2(): S3Client {
  if (!client) {
    const env = getEnv();
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Upload a file from the server. Returns the object key. */
export async function uploadObject(key: string, body: Buffer | Uint8Array, contentType: string) {
  await r2().send(
    new PutObjectCommand({
      Bucket: getEnv().R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

export async function deleteObject(key: string) {
  await r2().send(new DeleteObjectCommand({ Bucket: getEnv().R2_BUCKET_NAME, Key: key }));
}

/** Presigned PUT URL so the browser can upload directly to R2 (expires in 5 min). */
export async function getUploadUrl(key: string, contentType: string, expiresIn = 300) {
  return getSignedUrl(
    r2(),
    new PutObjectCommand({ Bucket: getEnv().R2_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn },
  );
}

/** Short-lived read URL for PRIVATE objects (student/teacher photos). */
export async function getPrivateReadUrl(key: string, expiresIn = 300) {
  return getSignedUrl(
    r2(),
    new GetObjectCommand({ Bucket: getEnv().R2_BUCKET_NAME, Key: key }),
    { expiresIn },
  );
}

/** Permanent URL for PUBLIC objects only (keys starting with "public/"). */
export function getPublicUrl(key: string) {
  const base = getEnv().R2_PUBLIC_URL;
  if (!base) throw new Error("R2_PUBLIC_URL is not set");
  if (!key.startsWith("public/")) throw new Error("Only public/ keys have public URLs");
  return `${base.replace(/\/$/, "")}/${key}`;
}
