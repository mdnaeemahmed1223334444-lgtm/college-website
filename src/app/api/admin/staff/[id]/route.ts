import { NextResponse } from "next/server";
import { getStaffProfileById } from "@/features/staff/queries";
import { saveStaffProfileAction, deleteStaffProfileAction } from "@/features/staff/actions";
import { requireRole } from "@/lib/auth/current-user";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staff = await getStaffProfileById(id);
    if (!staff) {
      return NextResponse.json({ error: "Staff profile not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, staff });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error retrieving staff profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const body = await request.json();

    const formData = new FormData();
    formData.append("id", id);
    for (const [key, val] of Object.entries(body)) {
      if (key !== "id" && val !== undefined && val !== null) {
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

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unauthorized or failed to update profile";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await params;
    const result = await deleteStaffProfileAction(id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unauthorized or failed to delete profile";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
