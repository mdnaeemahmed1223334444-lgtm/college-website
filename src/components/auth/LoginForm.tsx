"use client";

import { useActionState } from "react";
import { loginAction, quickTestLoginAction } from "@/features/auth/actions";
import type { LoginState } from "@/features/auth/types";

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <div className="space-y-6">
      {/* Test Mode 1-click Quick Login */}
      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            🧪 Testing Mode Active
          </span>
          <span className="text-xs text-gray-500">No credentials required</span>
        </div>
        <p className="mb-3 text-xs text-gray-600">
          Click any role below to enter the portal immediately without entering a password:
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <form action={quickTestLoginAction}>
            {next && <input type="hidden" name="next" value={next} />}
            <input type="hidden" name="role" value="admin" />
            <button
              type="submit"
              className="flex w-full flex-col items-center justify-center rounded-md border border-purple-300 bg-white p-3 text-center shadow-sm transition hover:border-purple-600 hover:bg-purple-50 focus:outline-none"
            >
              <span className="text-lg">🛡️</span>
              <span className="text-xs font-bold text-gray-800">Administrator</span>
              <span className="text-[10px] text-gray-500">Full System Access</span>
            </button>
          </form>

          <form action={quickTestLoginAction}>
            {next && <input type="hidden" name="next" value={next} />}
            <input type="hidden" name="role" value="teacher" />
            <button
              type="submit"
              className="flex w-full flex-col items-center justify-center rounded-md border border-emerald-300 bg-white p-3 text-center shadow-sm transition hover:border-emerald-600 hover:bg-emerald-50 focus:outline-none"
            >
              <span className="text-lg">👩‍🏫</span>
              <span className="text-xs font-bold text-gray-800">Teacher</span>
              <span className="text-[10px] text-gray-500">Attendance & Marks</span>
            </button>
          </form>

          <form action={quickTestLoginAction}>
            {next && <input type="hidden" name="next" value={next} />}
            <input type="hidden" name="role" value="student" />
            <button
              type="submit"
              className="flex w-full flex-col items-center justify-center rounded-md border border-amber-300 bg-white p-3 text-center shadow-sm transition hover:border-amber-600 hover:bg-amber-50 focus:outline-none"
            >
              <span className="text-lg">🎓</span>
              <span className="text-xs font-bold text-gray-800">Student</span>
              <span className="text-[10px] text-gray-500">Results & Routine</span>
            </button>
          </form>
        </div>
      </div>

      {/* Or Standard Form with Optional Credentials */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">Or simulate standard login</span>
        </div>
      </div>

      <form action={formAction} className="space-y-3">
        {next && <input type="hidden" name="next" value={next} />}

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Select Portal / Role</label>
          <select
            name="role"
            defaultValue="admin"
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="admin">Administrator Portal</option>
            <option value="teacher">Teacher Portal</option>
            <option value="student">Student Portal</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Email (optional during testing)</label>
          <input
            name="email"
            type="email"
            placeholder="admin@college.edu"
            autoComplete="username"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Password (optional during testing)</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow transition hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Continue to Portal"}
        </button>
      </form>
    </div>
  );
}
