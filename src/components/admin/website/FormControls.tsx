"use client";

import { useFormStatus } from "react-dom";
import type { ActionFeedback } from "@/features/website/types";

export function SubmitButton({ label = "Save Changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function FeedbackAlert({ state }: { state?: ActionFeedback }) {
  if (!state || (!state.error && !state.message)) return null;

  if (state.error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        {state.error}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
      {state.message}
    </div>
  );
}
