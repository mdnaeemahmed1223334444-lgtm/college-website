import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getStudentProfile } from "@/features/profile/queries";
import { updateStudentProfileSchema } from "@/features/profile/schema";
import { privateAdmin } from "@/lib/supabase/private-server";

// GET /api/student/profile
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "student" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const profile = await getStudentProfile(user.id);
    return NextResponse.json({ success: true, data: profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PUT /api/student/profile
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "student" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateStudentProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const supabase = privateAdmin();
    if (supabase && user.id && user.id !== "dev-user") {
      const { error } = await supabase
        .from("students")
        .update({
          phone: parsed.data.phone,
          email: parsed.data.email,
          address: parsed.data.address,
          guardian_phone: parsed.data.guardianPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
