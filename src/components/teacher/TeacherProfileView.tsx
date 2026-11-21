"use client";

import { useActionState, useState } from "react";
import type { TeacherProfile, ProfileFeedback } from "@/features/profile/types";
import {
  updateTeacherProfileAction,
  changePasswordAction,
} from "@/features/profile/actions";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";

export default function TeacherProfileView({ profile }: { profile: TeacherProfile }) {
  const [activeTab, setActiveTab] = useState<"overview" | "qualification" | "edit" | "security">("overview");
  const [editState, editAction] = useActionState<ProfileFeedback, FormData>(updateTeacherProfileAction, {});
  const [pwState, pwAction] = useActionState<ProfileFeedback, FormData>(changePasswordAction, {});

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Profile Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-emerald-700 via-teal-600 to-blue-800" />

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
                <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-3xl font-bold text-emerald-700">
                  {profile.fullName.charAt(0)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900">{profile.fullName}</h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  ● ACTIVE FACULTY
                </span>
              </div>

              {profile.banglaName && (
                <p className="text-sm font-medium text-gray-500">{profile.banglaName}</p>
              )}

              <p className="text-sm font-semibold text-blue-700">
                {profile.designation} &bull; {profile.department}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-gray-600">
                <span className="font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                  Code: {profile.teacherCode}
                </span>
                <span>&bull;</span>
                <span>Joined: {new Date(profile.joiningDate).getFullYear()}</span>
                {profile.isClassTeacher && (
                  <>
                    <span>&bull;</span>
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Class Teacher
                    </span>
                  </>
                )}
              </div>
            </div>
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
          👨‍🏫 Faculty Role & Classes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("qualification")}
          className={`px-5 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
            activeTab === "qualification"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🎓 Qualifications & Bio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`px-5 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
            activeTab === "edit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ✏️ Edit Profile Info
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

      {/* Tab 1: Faculty Role & Teaching Assignments */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Professional Summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                <span>🏛️</span> Institutional Role
              </h3>

              <dl className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-gray-400 font-medium">Faculty Code</dt>
                  <dd className="font-mono font-bold text-gray-900 text-sm mt-0.5">{profile.teacherCode}</dd>
                </div>

                <div>
                  <dt className="text-gray-400 font-medium">Designation</dt>
                  <dd className="font-bold text-gray-900 text-sm mt-0.5">{profile.designation}</dd>
                </div>

                <div className="col-span-2">
                  <dt className="text-gray-400 font-medium">Department</dt>
                  <dd className="font-semibold text-blue-700 mt-0.5">{profile.department}</dd>
                </div>

                <div>
                  <dt className="text-gray-400 font-medium">Date of Joining</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">{profile.joiningDate}</dd>
                </div>

                <div>
                  <dt className="text-gray-400 font-medium">Office Room</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">{profile.roomNumber || "Faculty Room"}</dd>
                </div>

                {profile.classTeacherOf && (
                  <div className="col-span-2 rounded-lg border border-purple-200 bg-purple-50/50 p-3">
                    <dt className="text-purple-900 font-bold">Class Teacher Assignment</dt>
                    <dd className="font-semibold text-purple-800 text-xs mt-0.5">
                      ⭐ {profile.classTeacherOf}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Official Contact */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                <span>📞</span> Contact Information
              </h3>

              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-gray-400 font-medium">Institutional Email</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">{profile.email}</dd>
                </div>

                <div>
                  <dt className="text-gray-400 font-medium">Official Mobile Phone</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">{profile.phone}</dd>
                </div>

                <div>
                  <dt className="text-gray-400 font-medium">Blood Group</dt>
                  <dd className="inline-flex rounded bg-red-100 px-2 py-0.5 font-bold text-red-700 text-xs mt-0.5">
                    {profile.bloodGroup}
                  </dd>
                </div>

                {profile.address && (
                  <div>
                    <dt className="text-gray-400 font-medium">Residential Address</dt>
                    <dd className="font-medium text-gray-800 mt-0.5 leading-relaxed">{profile.address}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Assigned Classes */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>📚</span> Current Teaching Assignments & Schedule
              </h3>
              <span className="text-xs text-gray-400">{profile.assignedClasses.length} assigned slots</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {profile.assignedClasses.map((ac, idx) => (
                <div key={idx} className="rounded-lg border border-gray-100 bg-gray-50/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                      {ac.className}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">{ac.group}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{ac.subject}</h4>
                  {ac.time && (
                    <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                      <span>⏰</span> {ac.time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Qualifications & Bio */}
      {activeTab === "qualification" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">🎓 Academic Background & Degrees</h3>
              <p className="text-sm text-gray-700 mt-2 font-medium leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                {profile.qualification}
              </p>
            </div>

            {profile.specialization && (
              <div>
                <h3 className="text-sm font-bold text-gray-900">🔬 Key Specializations & Research Focus</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {profile.specialization}
                </p>
              </div>
            )}

            {profile.bio && (
              <div>
                <h3 className="text-sm font-bold text-gray-900">📝 Biographical Summary</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Edit Profile */}
      {activeTab === "edit" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs max-w-2xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">✏️ Update Profile Details</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Update your contact info, office room, and academic bio.
            </p>
          </div>

          <FeedbackAlert state={editState} />

          <form action={editAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Official Mobile Phone *</label>
                <input
                  name="phone"
                  defaultValue={profile.phone}
                  required
                  placeholder="+880 17..."
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Official Email *</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={profile.email}
                  required
                  placeholder="name@college.edu"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Office Desk / Room Number</label>
                <input
                  name="roomNumber"
                  defaultValue={profile.roomNumber || ""}
                  placeholder="e.g. Science Building, Room 304"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Specialization</label>
                <input
                  name="specialization"
                  defaultValue={profile.specialization || ""}
                  placeholder="e.g. Optics, Electronics"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Residential Address</label>
              <textarea
                name="address"
                rows={2}
                defaultValue={profile.address || ""}
                placeholder="House, Area, Dhaka"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Biographical Summary</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile.bio || ""}
                placeholder="Brief summary of teaching experience, research interests, and mentoring roles..."
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2 border-t">
              <SubmitButton label="💾 Save Changes" />
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Security & Password */}
      {activeTab === "security" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs max-w-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">🔒 Change Password</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Ensure your faculty account is secured with a strong password.
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
