import { getEnv } from "@/config/env";
import { mainAdmin } from "@/lib/supabase/main-server";
import { privateAdmin } from "@/lib/supabase/private-server";
import { ok } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

type Check = "ok" | "error" | "skipped";

/** GET /api/health : verifies env + both databases are reachable. */
export async function GET() {
  const result: Record<string, Check | string> = { env: "skipped", main_db: "skipped", private_db: "skipped" };

  try {
    getEnv();
    result.env = "ok";
  } catch (e) {
    result.env = "error";
    result.env_message = e instanceof Error ? e.message : "unknown";
    return ok(result);
  }

  const mainClient = mainAdmin();
  if (mainClient) {
    const main = await mainClient.from("site_settings").select("key").limit(1);
    result.main_db = main.error ? "error" : "ok";
  } else {
    result.main_db = "error";
  }

  const priv = await privateAdmin().from("academic_sessions").select("id").limit(1);
  result.private_db = priv.error ? "error" : "ok";

  return ok(result);
}
