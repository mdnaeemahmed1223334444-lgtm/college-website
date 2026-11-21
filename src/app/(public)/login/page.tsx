import LoginForm from "@/components/auth/LoginForm";

// Login / Portal page. One login for Admin, Teacher and Student; the role decides the destination.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-5 py-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">College Portal Sign-In</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to access your administrative workspace, teacher portal, or student dashboard.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
