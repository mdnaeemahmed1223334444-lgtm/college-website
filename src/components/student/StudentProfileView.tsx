"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { StudentProfile, ProfileFeedback } from "@/features/profile/types";
import { changePasswordAction } from "@/features/profile/actions";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";

export default function StudentProfileView({ profile }: { profile: StudentProfile }) {
  const [activeTab, setActiveTab] = useState<"overview" | "guardian" | "security">("overview");
  const [pwState, pwAction] = useActionState<ProfileFeedback, FormData>(changePasswordAction, {});

  const groupLabel =
    profile.group === "science"
      ? "Science"
      : profile.group === "business_studies"
      ? "Business Studies"
      : "Humanities";

  const yearLabel = profile.batchYear === "first_year" ? "1st Year (XI)" : "2nd Year (XII)";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Profile Card Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800" />

        <div className="relative pt-8 sm:flex sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Photo */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-md">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-100 text-3xl font-bold text-blue-700">
                  {profile.fullName.charAt(0)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900">{profile.fullName}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  ● {profile.status.toUpperCase()}
                </span>
              </div>

              {profile.banglaName && (
                <p className="text-sm font-medium text-gray-500">{profile.banglaName}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-gray-600">
                <span className="font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                  ID: {profile.studentCode}
                </span>
                <span>&bull;</span>
                <span className="font-semibold text-blue-700">{profile.batchName}</span>
                <span>&bull;</span>
                <span>{yearLabel}</span>
                <span>&bull;</span>
                <span className="font-semibold">{groupLabel}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end gap-2">
            <Link
              href="/student/id-card"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 transition"
            >
              <span>🪪</span>
              <span>Digital ID Card</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🎓 Academic & Identity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guardian")}
          className={`px-5 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
            activeTab === "guardian"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          👨‍👩‍👦 Personal & Guardian
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-5 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🔒 Security & Password
        </button>
      </div>

      {/* Official Read-only Notice */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-3">
        <span className="text-base">🔒</span>
        <div>
          <span className="font-bold">Official Student Record:</span> Your profile credentials and family details are officially maintained by the College Administration. If any corrections are needed, please contact the college administration office.
        </div>
      </div>

      {/* Tab 1: Academic & Identity */}
      {activeTab === "overview" && (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Academic Details Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <span>🏫</span> Academic Enrollment
            </h3>

            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-gray-400 font-medium">Student Code</dt>
                <dd className="font-mono font-bold text-gray-900 text-sm mt-0.5">{profile.studentCode}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Class Roll</dt>
                <dd className="font-bold text-gray-900 text-sm mt-0.5">{profile.roll}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Batch</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{profile.batchName}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Current Year</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{yearLabel}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Study Group</dt>
                <dd className="font-semibold text-blue-700 mt-0.5">{groupLabel}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Academic Session</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{profile.academicSession}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Admission Date</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{profile.admissionDate}</dd>
              </div>
            </dl>
          </div>

          {/* Contact Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <span>📞</span> Contact Information
            </h3>

            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-gray-400 font-medium">Personal Mobile Phone</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{profile.phone}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Email Address</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{profile.email}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Present Living Address</dt>
                <dd className="font-medium text-gray-800 mt-0.5 leading-relaxed">{profile.address}</dd>
              </div>

              {profile.permanentAddress && (
                <div>
                  <dt className="text-gray-400 font-medium">Permanent Village Address</dt>
                  <dd className="font-medium text-gray-800 mt-0.5 leading-relaxed">{profile.permanentAddress}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Tab 2: Personal & Guardian */}
      {activeTab === "guardian" && (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Guardian Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <span>👨‍👩‍👦</span> Parents & Guardian
            </h3>

            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-gray-400 font-medium">Father&apos;s Name</dt>
                <dd className="font-semibold text-gray-900 mt-0.5 text-sm">{profile.fatherName}</dd>
                {profile.fatherPhone && (
                  <p className="text-[11px] text-gray-500 mt-0.5">Tel: {profile.fatherPhone}</p>
                )}
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Mother&apos;s Name</dt>
                <dd className="font-semibold text-gray-900 mt-0.5 text-sm">{profile.motherName}</dd>
                {profile.motherPhone && (
                  <p className="text-[11px] text-gray-500 mt-0.5">Tel: {profile.motherPhone}</p>
                )}
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <dt className="text-amber-900 font-bold">Designated Emergency Guardian</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">
                  {profile.guardianName} ({profile.guardianRelation || "Guardian"})
                </dd>
                <dd className="text-xs text-amber-800 font-bold mt-1">
                  📞 Emergency Contact: {profile.guardianPhone}
                </dd>
              </div>
            </dl>
          </div>

          {/* Personal Bio Data */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <span>🪪</span> Personal Particulars
            </h3>

            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-gray-400 font-medium">Date of Birth</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{profile.dateOfBirth}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Blood Group</dt>
                <dd className="inline-flex rounded bg-red-100 px-2 py-0.5 font-bold text-red-700 text-xs mt-0.5">
                  {profile.bloodGroup}
                </dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Gender</dt>
                <dd className="font-semibold text-gray-900 capitalize mt-0.5">{profile.gender}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Religion</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{profile.religion}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Nationality</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{profile.nationality}</dd>
              </div>

              <div>
                <dt className="text-gray-400 font-medium">Account Status</dt>
                <dd className="font-semibold text-emerald-700 mt-0.5 capitalize">{profile.status}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Password */}
      {activeTab === "security" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs max-w-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">🔒 Change Password</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Ensure your account is using a strong password of at least 6 characters.
            </p>
          </div>

          <FeedbackAlert state={pwState} />

          <form action={pwAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Current Password *</label>
              <input
                name="currentPassword"
                type="password"
                required
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">New Password *</label>
              <input
                name="newPassword"
                type="password"
                minLength={6}
                required
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-gray-400">Must be at least 6 characters.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Confirm New Password *</label>
              <input
                name="confirmPassword"
                type="password"
                minLength={6}
                required
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2 border-t">
              <SubmitButton label="🔑 Update Password" />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
