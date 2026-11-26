import { redirect } from "next/navigation";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { getBrandingSettings } from "@/features/website/queries";
import StudentLoginForm from "@/components/student/StudentLoginForm";

export const metadata = {
  title: "Student Login | Student Portal",
  description: "Sign in to your student portal to access your academic records, attendance, and notices.",
};

export default async function StudentLoginPage() {
  // If already authenticated, redirect to dashboard
  const student = await getAuthenticatedStudent();
  if (student) {
    redirect("/student/dashboard");
  }

  // Fetch branding for college name/logo
  const branding = await getBrandingSettings();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* College Branding */}
        <div className="text-center mb-8">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.collegeName}
              className="h-20 w-20 rounded-full object-cover mx-auto mb-4 shadow-lg ring-4 ring-white"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white">
              <span className="text-2xl font-black text-white">
                {branding.shortName?.slice(0, 2) || "SC"}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {branding.collegeName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Student Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5">
            <h2 className="text-lg font-bold text-white">Sign In to Your Account</h2>
            <p className="text-blue-100 text-xs mt-1">
              Enter your Student ID and password to continue
            </p>
          </div>

          <div className="p-6">
            <StudentLoginForm />
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Forgot your password? Contact the college administration office.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
          >
            ← Back to College Website
          </a>
        </div>
      </div>
    </div>
  );
}
