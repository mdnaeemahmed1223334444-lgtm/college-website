"use client";

import { useActionState } from "react";
import { studentLoginAction } from "@/features/students/auth-actions";
import type { StudentAuthFeedback } from "@/features/students/auth-actions";

const initialState: StudentAuthFeedback = {};

export default function StudentLoginForm() {
  const [state, formAction, isPending] = useActionState(studentLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {/* Error Alert */}
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <span className="text-base">⚠️</span>
          <p>{state.error}</p>
        </div>
      )}

      {/* Student ID */}
      <div>
        <label
          htmlFor="student_id"
          className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
        >
          Student ID
        </label>
        <input
          id="student_id"
          name="student_id"
          type="text"
          autoComplete="username"
          required
          placeholder="e.g. STU-2026-1003"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 py-3 px-4 text-sm font-bold text-white shadow-sm hover:from-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing In…
          </span>
        ) : (
          "Sign In to Student Portal"
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        No self-registration. Accounts are created by administrators only.
      </p>
    </form>
  );
}
