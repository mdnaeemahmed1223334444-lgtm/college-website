import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { getNotices } from "@/features/content/queries";

export const metadata = {
  title: "Notices & Announcements | Student Portal",
};

function categoryBadge(category?: string) {
  const colors: Record<string, string> = {
    Admission: "bg-purple-100 text-purple-800",
    Examination: "bg-red-100 text-red-800",
    Academic: "bg-blue-100 text-blue-800",
    General: "bg-gray-100 text-gray-700",
    Event: "bg-amber-100 text-amber-800",
    Urgent: "bg-rose-100 text-rose-800",
  };
  return colors[category || ""] || "bg-gray-100 text-gray-700";
}

export default async function StudentNoticesPage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  const notices = await getNotices({ status: "published", limit: 50 });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Notices &amp; Announcements
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Official notices from college administration
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Notices List */}
      {notices.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-4xl mb-3">📢</p>
          <p className="font-semibold text-gray-900">No notices published yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Check back later for college announcements and updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`rounded-xl border bg-white overflow-hidden shadow-sm transition hover:shadow-md ${
                notice.is_urgent
                  ? "border-red-200 ring-1 ring-red-100"
                  : notice.is_pinned
                  ? "border-amber-200 ring-1 ring-amber-100"
                  : "border-gray-200"
              }`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  {notice.is_urgent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-xs font-bold uppercase">
                      🚨 Urgent
                    </span>
                  )}
                  {notice.is_pinned && !notice.is_urgent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-xs font-bold">
                      📌 Pinned
                    </span>
                  )}
                  {notice.category && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${categoryBadge(notice.category)}`}
                    >
                      {notice.category}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {notice.title}
                </h3>

                {notice.published_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notice.published_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}

                {/* Content Preview */}
                {notice.content && (
                  <div
                    className="mt-3 text-sm text-gray-700 prose prose-sm max-w-none line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: notice.content }}
                  />
                )}

                {/* Attachment */}
                {notice.attachment_url && (
                  <a
                    href={notice.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                  >
                    📎 Download Attachment
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
