import { NextResponse } from "next/server";
import { getStaffList, getStaffStats } from "@/features/staff/queries";
import { saveStaffProfileAction } from "@/features/staff/actions";
import { requireRole } from "@/lib/auth/current-user";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const department = searchParams.get("department") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const [staff, stats] = await Promise.all([
      getStaffList({ role, department, status, search }),
      getStaffStats(),
    ]);

    return NextResponse.json({ success: true, stats, count: staff.length, staff });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching staff";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);
    const body = await request.json();

    const formData = new FormData();
    for (const [key, val] of Object.entries(body)) {
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          formData.append(key, val.join(","));
        } else {
          formData.append(key, String(val));
        }
      }
    }

    const result = await saveStaffProfileAction({}, formData);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unauthorized or failed to create profile";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
