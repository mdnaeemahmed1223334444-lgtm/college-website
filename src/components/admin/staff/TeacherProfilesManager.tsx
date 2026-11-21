"use client";

import { useState, useActionState } from "react";
import type { StaffProfileRecord, StaffFeedback } from "@/features/staff/types";
import { saveStaffProfileAction, deleteStaffProfileAction } from "@/features/staff/actions";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function TeacherProfilesManager({
  teachers,
  selectedId,
}: {
  teachers: StaffProfileRecord[];
  selectedId?: string;
}) {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [viewingProfile, setViewingProfile] = useState<StaffProfileRecord | null>(() => {
    if (selectedId) {
      return teachers.find((t) => t.id === selectedId) || null;
    }
    return null;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<StaffProfileRecord | null>(null);

  const [state, formAction] = useActionState<StaffFeedback, FormData>(
    saveStaffProfileAction,
    {}
  );

  const departments = [
    "all",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Bangla",
    "English",
    "Information & Communication Technology",
    "Accounting",
    "Business Organization & Management",
    "Finance & Banking",
    "Economics",
    "Civics & Good Governance",
  ];

  const filtered = teachers.filter((t) => {
    if (selectedDept !== "all" && t.department.toLowerCase() !== selectedDept.toLowerCase()) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        t.full_name.toLowerCase().includes(q) ||
        (t.bangla_name && t.bangla_name.includes(q)) ||
        t.employee_id.toLowerCase().includes(q) ||
        t.designation.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        (t.specialization && t.specialization.toLowerCase().includes(q))
      );
    }
    return true;
  });

  function handleOpenCreate() {
    setEditingTeacher(null);
    setIsAddModalOpen(true);
  }

  function handleOpenEdit(t: StaffProfileRecord) {
    setViewingProfile(null);
    setEditingTeacher(t);
    setIsAddModalOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove the profile for ${name}?`)) return;
    const res = await deleteStaffProfileAction(id);
    if (res.error) alert(res.error);
    else {
      setViewingProfile(null);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Teacher Profiles Directory</h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse, manage, and create rich faculty profiles with academic credentials, research areas, and teaching portfolios.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-teal-800"
        >
          <span className="text-base font-bold">+</span> Add Teacher Profile
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search teacher by name, ID, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-gray-500 shrink-0">Dept:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium focus:border-teal-500 focus:outline-none"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "all" ? "All Departments" : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((teacher) => (
          <div
            key={teacher.id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
          >
            {/* Top row */}
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 font-bold text-lg">
                {teacher.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={teacher.photo_url}
                    alt={teacher.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  teacher.full_name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-mono font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {teacher.employee_id}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      teacher.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {teacher.status === "active" ? "Active" : teacher.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mt-1 truncate">
                  {teacher.full_name}
                </h3>
                {teacher.bangla_name && (
                  <p className="text-xs text-gray-500 truncate">{teacher.bangla_name}</p>
                )}
                <p className="text-xs text-teal-700 font-medium mt-0.5">{teacher.designation}</p>
              </div>
            </div>

            {/* Department & Badges */}
            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              <span className="inline-block rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-medium text-teal-800">
                {teacher.department}
              </span>
              {teacher.is_head_of_department && (
                <span className="inline-block rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                  👑 Head of Dept
                </span>
              )}
              {teacher.is_class_teacher && (
                <span className="inline-block rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[11px] font-medium text-purple-800">
                  CT: {teacher.class_teacher_section}
                </span>
              )}
            </div>

            {/* Academic & Specialty */}
            <div className="mt-3 text-xs text-gray-600 border-t border-gray-100 pt-3 space-y-1">
              <div>
                <strong className="text-gray-900">Highest Degree:</strong> {teacher.highest_degree}
              </div>
              {teacher.specialization && (
                <div className="text-[11px] text-gray-500 line-clamp-1">
                  <strong className="text-gray-700">Focus:</strong> {teacher.specialization}
                </div>
              )}
              {teacher.room_number && (
                <div className="text-[11px] text-gray-500">
                  <strong className="text-gray-700">Room:</strong> {teacher.room_number}
                </div>
              )}
            </div>

            {/* Assigned subjects */}
            {teacher.assigned_subjects && teacher.assigned_subjects.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {teacher.assigned_subjects.slice(0, 3).map((sub, i) => (
                  <span
                    key={i}
                    className="inline-block text-[10px] bg-gray-100 text-gray-700 rounded px-1.5 py-0.5"
                  >
                    {sub}
                  </span>
                ))}
                {teacher.assigned_subjects.length > 3 && (
                  <span className="text-[10px] text-gray-400 self-center">
                    +{teacher.assigned_subjects.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">
                {teacher.weekly_periods || 0} periods/wk
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingProfile(teacher)}
                  className="rounded bg-teal-50 px-2.5 py-1 font-semibold text-teal-800 hover:bg-teal-100 transition"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleOpenEdit(teacher)}
                  className="rounded border border-gray-300 px-2.5 py-1 font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-teal-800 to-emerald-900 p-6 text-white">
              <button
                onClick={() => setViewingProfile(null)}
                className="absolute top-4 right-4 rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
              >
                ✕
              </button>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-white/60 bg-teal-700 flex items-center justify-center text-2xl font-bold">
                  {viewingProfile.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={viewingProfile.photo_url}
                      alt={viewingProfile.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    viewingProfile.full_name.charAt(0)
                  )}
                </div>
                <div>
                  <span className="text-xs font-mono bg-teal-900/60 px-2 py-0.5 rounded text-teal-200">
                    {viewingProfile.employee_id}
                  </span>
                  <h2 className="text-xl font-bold mt-1">{viewingProfile.full_name}</h2>
                  {viewingProfile.bangla_name && (
                    <p className="text-sm text-teal-100">{viewingProfile.bangla_name}</p>
                  )}
                  <p className="text-xs text-teal-200 font-medium mt-0.5">
                    {viewingProfile.designation} • {viewingProfile.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-sm text-gray-700">
              {/* Bio */}
              {viewingProfile.bio && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    About / Biography
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {viewingProfile.bio}
                  </p>
                </div>
              )}

              {/* Academic & Professional */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Academic & Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-gray-500">Highest Degree:</span>
                    <p className="font-semibold text-gray-900">{viewingProfile.highest_degree}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Graduating Institution:</span>
                    <p className="font-semibold text-gray-900">{viewingProfile.institution || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Specialization / Research:</span>
                    <p className="font-semibold text-gray-900">{viewingProfile.specialization || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Experience & Joining:</span>
                    <p className="font-semibold text-gray-900">
                      {viewingProfile.experience_years || 0} years • Joined {viewingProfile.joining_date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Teaching Responsibilities & Classes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Teaching Schedule & Load
                </h4>
                <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Weekly Teaching Load:</span>
                    <span className="font-bold text-teal-800">
                      {viewingProfile.weekly_periods || 0} periods per week
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Assigned Subjects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewingProfile.assigned_subjects?.map((s, i) => (
                        <span key={i} className="rounded bg-teal-100 px-2 py-0.5 text-teal-900 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Assigned Classes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewingProfile.assigned_classes?.map((c, i) => (
                        <span key={i} className="rounded bg-indigo-100 px-2 py-0.5 text-indigo-900 text-xs font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  {viewingProfile.is_class_teacher && (
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-500">Class Teacher of:</span>
                      <span className="ml-2 font-bold text-purple-700">
                        {viewingProfile.class_teacher_section}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & Office */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Contact & Campus Office
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-semibold text-gray-900">{viewingProfile.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-semibold text-gray-900">{viewingProfile.email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Room / Office:</span>
                    <p className="font-semibold text-gray-900">{viewingProfile.room_number || "Main Campus"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Blood Group:</span>
                    <p className="font-semibold text-gray-900">{viewingProfile.blood_group}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
              <button
                onClick={() => handleDelete(viewingProfile.id, viewingProfile.full_name)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                Delete Profile
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingProfile(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => handleOpenEdit(viewingProfile)}
                  className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Profile Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 bg-teal-800 px-6 py-4 text-white">
              <div>
                <h3 className="text-lg font-bold">
                  {editingTeacher ? `Edit Profile: ${editingTeacher.full_name}` : "Add Teacher Profile"}
                </h3>
                <p className="text-xs text-teal-100">
                  Register teacher details, credentials, and teaching duties.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-teal-200 hover:bg-teal-700 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <input type="hidden" name="role" value="teacher" />
              {editingTeacher && <input type="hidden" name="id" value={editingTeacher.id} />}
              <FeedbackAlert state={state} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Teacher Name (English) *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    defaultValue={editingTeacher?.full_name || ""}
                    placeholder="e.g. Dr. Kazi Mahbubur Rahman"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Teacher Name (বাংলা)
                  </label>
                  <input
                    type="text"
                    name="bangla_name"
                    defaultValue={editingTeacher?.bangla_name || ""}
                    placeholder="e.g. ড. কাজী মাহবুবুর রহমান"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    defaultValue={editingTeacher?.designation || "Assistant Professor"}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    name="department"
                    defaultValue={editingTeacher?.department || "Physics"}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    {departments
                      .filter((d) => d !== "all")
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    defaultValue={editingTeacher?.employee_id || ""}
                    placeholder="Auto if blank (e.g. T-105)"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    defaultValue={editingTeacher?.phone || ""}
                    placeholder="+880 1711-XXXXXX"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingTeacher?.email || ""}
                    placeholder="teacher@college.edu.bd"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Highest Degree *</label>
                  <input
                    type="text"
                    name="highest_degree"
                    required
                    defaultValue={editingTeacher?.highest_degree || "M.Sc in Physics"}
                    placeholder="e.g. M.Sc in Physics (DU)"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    defaultValue={editingTeacher?.specialization || ""}
                    placeholder="e.g. Quantum Electronics"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <ImageUploadInput
                    name="photo_url"
                    label="Teacher Profile Photo"
                    defaultValue={editingTeacher?.photo_url || ""}
                    folder="teachers"
                    helperText="Upload teacher photo directly from your device (JPG, PNG, WebP up to 10MB)."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Campus Room / Office</label>
                  <input
                    type="text"
                    name="room_number"
                    defaultValue={editingTeacher?.room_number || ""}
                    placeholder="e.g. Room 204, Science Complex"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assigned Subjects (comma separated)
                </label>
                <input
                  type="text"
                  name="assigned_subjects"
                  defaultValue={editingTeacher?.assigned_subjects?.join(", ") || ""}
                  placeholder="e.g. Physics 1st Paper, Physics 2nd Paper, Physics Practical"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Weekly Periods</label>
                  <input
                    type="number"
                    name="weekly_periods"
                    defaultValue={editingTeacher?.weekly_periods || 18}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_head_modal"
                    name="is_head_of_department"
                    value="true"
                    defaultChecked={editingTeacher?.is_head_of_department || false}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="is_head_modal" className="text-xs font-semibold text-gray-800">
                    Head of Department (HOD)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Biography / Bio</label>
                <textarea
                  name="bio"
                  rows={2}
                  defaultValue={editingTeacher?.bio || ""}
                  placeholder="Brief academic introduction..."
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <SubmitButton label={editingTeacher ? "Update Profile" : "Save Teacher Profile"} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
