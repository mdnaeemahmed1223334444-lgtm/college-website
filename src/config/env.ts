import "server-only";
import { z } from "zod";

const schema = z.object({
  MAIN_SUPABASE_URL: z.string().url(),
  MAIN_SUPABASE_ANON_KEY: z.string().min(1),
  MAIN_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  PRIVATE_SUPABASE_URL: z.string().url(),
  PRIVATE_SUPABASE_ANON_KEY: z.string().min(1),
  PRIVATE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  R2_PUBLIC_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/** Validated server env. Lazy so `next build` does not fail without secrets. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid/missing environment variables: ${missing}`);
  }
  cached = parsed.data;
  return cached;
}
