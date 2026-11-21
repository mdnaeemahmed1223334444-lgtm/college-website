"use client";

import { useState, useActionState, useEffect } from "react";
import type { StaffProfileRecord, StaffFeedback } from "@/features/staff/types";
import { saveStaffProfileAction, deleteStaffProfileAction } from "@/features/staff/actions";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

interface TeacherFormData {
  full_name: string;
  bangla_name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  highest_degree: string;
  institution: string;
  gender: "male" | "female" | "other";
  blood_group: string;
  joining_date: string;
  experience_years: number;
  employment_type: "permanent" | "contractual" | "part_time" | "guest";
  photo_url: string;
  assigned_subjects: string;
  weekly_periods: number;
  is_head_of_department: boolean;
  is_class_teacher: boolean;
  class_teacher_section: string;
  bio: string;
}

const DEFAULT_TEACHER_FORM: TeacherFormData = {
  full_name: "",
  bangla_name: "",
  designation: "Assistant Professor",
  department: "Physics",
  phone: "",
  email: "",
  highest_degree: "M.Sc",
  institution: "",
  gender: "male",
  blood_group: "A+",
  joining_date: new Date().toISOString().split("T")[0],
  experience_years: 0,
  employment_type: "permanent",
  photo_url: "",
  assigned_subjects: "",
  weekly_periods: 18,
  is_head_of_department: false,
  is_class_teacher: false,
  class_teacher_section: "",
  bio: "",
};

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
    if (selectedId) return teachers.find((t) => t.id === selectedId) || null;
    return null;
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<StaffProfileRecord | null>(null);

  const [formValues, setFormValues] = useState<TeacherFormData>(DEFAULT_TEACHER_FORM);
  const [clientError, setClientError] = useState<string | null>(null);

  const [state, formAction] = useActionState<StaffFeedback, FormData>(saveStaffProfileAction, {});

  // Populate formValues when editing
  useEffect(() => {
    if (editingTeacher) {
      setFormValues({
        full_name: editingTeacher.full_name || "",
        bangla_name: editingTeacher.bangla_name || "",
        designation: editingTeacher.designation || "Assistant Professor",
        department: editingTeacher.department || "Physics",
        phone: editingTeacher.phone || "",
        email: editingTeacher.email || "",
        highest_degree: editingTeacher.highest_degree || "M.Sc",
        institution: editingTeacher.institution || "",
        gender: editingTeacher.gender || "male",
        blood_group: editingTeacher.blood_group || "A+",
        joining_date: editingTeacher.joining_date || new Date().toISOString().split("T")[0],
        experience_years: editingTeacher.experience_years || 0,
        employment_type: editingTeacher.employment_type || "permanent",
        photo_url: editingTeacher.photo_url || "",
        assigned_subjects: editingTeacher.assigned_subjects?.join(", ") || "",
        weekly_periods: editingTeacher.weekly_periods || 18,
        is_head_of_department: editingTeacher.is_head_of_department || false,
        is_class_teacher: editingTeacher.is_class_teacher || false,
        class_teacher_section: editingTeacher.class_teacher_section || "",
        bio: editingTeacher.bio || "",
      });
    } else {
      setFormValues(DEFAULT_TEACHER_FORM);
    }
    setClientError(null);
  }, [editingTeacher]);

  // When save succeeds
  useEffect(() => {
    if (state.success) {
      setIsAddModalOpen(false);
      setEditingTeacher(null);
    }
  }, [state]);

  const departments = [
    "all", "Physics", "Chemistry", "Mathematics", "Biology", "Bangla", "English",
    "Information & Communication Technology", "Accounting",
    "Business Organization & Management", "Finance & Banking", "Economics",
    "Civics & Good Governance",
  ];

  const filtered = teachers.filter((t) => {
    if (selectedDept !== "all" && t.department.toLowerCase() !== selectedDept.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.full_name.toLowerCase().includes(q) ||
        (t.bangla_name && t.bangla_name.includes(q)) ||
        t.employee_id.toLowerCase().includes(q) ||
        t.designation.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function handleOpenCreate() {
    setEditingTeacher(null);
    setFormValues(DEFAULT_TEACHER_FORM);
    setClientError(null);
    setIsAddModalOpen(true);
  }

  function handleOpenEdit(t: StaffProfileRecord) {
    setViewingProfile(null);
    setEditingTeacher(t);
    setClientError(null);
    setIsAddModalOpen(true);
  }

  function handleCloseModal() {
    // Delete orphan uploaded photo if user cancelled without saving
    if (formValues.photo_url && formValues.photo_url.startsWith("/uploads/") && formValues.photo_url !== editingTeacher?.photo_url) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formValues.photo_url }),
      }).catch(() => {});
    }

    setIsAddModalOpen(false);
    setEditingTeacher(null);
    setClientError(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove profile for ${name}?`)) return;
    const res = await deleteStaffProfileAction(id);
    if (res.success) window.location.reload();
    else alert(res.error || "Failed to delete.");
  }

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormValues((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "full_name" && value.trim().length >= 2) {
      setClientError(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Teacher Profiles Directory</h1>
          <p className="text-xs text-gray-500 mt-1">Browse, manage, and create faculty profiles.</p>
        </div>
        <button onClick={handleOpenCreate} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-teal-800">
          <span className="text-base font-bold">+</span> Add Teacher Profile
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input type="text" placeholder="Search teacher by name, subject..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Dept:</span>
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium focus:border-teal-500 focus:outline-none">
            {departments.map((d) => <option key={d} value={d}>{d === "all" ? "All Departments" : d}</option>)}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((teacher) => (
          <div key={teacher.id} className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 font-bold text-lg">
                {teacher.photo_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={teacher.photo_url} alt={teacher.full_name} className="h-full w-full object-cover" />
                  : teacher.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${teacher.status === "active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {teacher.status === "active" ? "Active" : teacher.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mt-1 truncate">{teacher.full_name}</h3>
                {teacher.bangla_name && <p className="text-xs text-gray-500 truncate">{teacher.bangla_name}</p>}
                <p className="text-xs text-teal-700 font-medium mt-0.5">{teacher.designation}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="inline-block rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-medium text-teal-800">{teacher.department}</span>
              {teacher.is_head_of_department && <span className="inline-block rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">👑 Head of Dept</span>}
            </div>
            <div className="mt-3 text-xs text-gray-600 border-t border-gray-100 pt-3">
              <strong className="text-gray-900">Degree:</strong> {teacher.highest_degree}
            </div>
            {teacher.assigned_subjects && teacher.assigned_subjects.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {teacher.assigned_subjects.slice(0, 3).map((sub, i) => (
                  <span key={i} className="inline-block text-[10px] bg-gray-100 text-gray-700 rounded px-1.5 py-0.5">{sub}</span>
                ))}
                {teacher.assigned_subjects.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{teacher.assigned_subjects.length - 3} more</span>}
              </div>
            )}
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">{teacher.weekly_periods || 0} periods/wk</span>
              <div className="flex gap-2">
                <button onClick={() => setViewingProfile(teacher)} className="rounded bg-teal-50 px-2.5 py-1 font-semibold text-teal-800 hover:bg-teal-100 transition">View</button>
                <button onClick={() => handleOpenEdit(teacher)} className="rounded border border-gray-300 px-2.5 py-1 font-medium text-gray-700 hover:bg-gray-50 transition">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden">
            <div className="relative bg-gradient-to-r from-teal-800 to-emerald-900 p-6 text-white">
              <button onClick={() => setViewingProfile(null)} className="absolute top-4 right-4 rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20">✕</button>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-white/60 bg-teal-700 flex items-center justify-center text-2xl font-bold">
                  {viewingProfile.photo_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={viewingProfile.photo_url} alt={viewingProfile.full_name} className="h-full w-full object-cover" />
                    : viewingProfile.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{viewingProfile.full_name}</h2>
                  {viewingProfile.bangla_name && <p className="text-sm text-teal-100">{viewingProfile.bangla_name}</p>}
                  <p className="text-xs text-teal-200 font-medium mt-0.5">{viewingProfile.designation} • {viewingProfile.department}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto text-sm">
              {viewingProfile.bio && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Biography</h4>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">{viewingProfile.bio}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-lg">
                <div><span className="text-gray-500">Degree:</span><p className="font-semibold">{viewingProfile.highest_degree}</p></div>
                <div><span className="text-gray-500">Institution:</span><p className="font-semibold">{viewingProfile.institution || "N/A"}</p></div>
                <div><span className="text-gray-500">Experience:</span><p className="font-semibold">{viewingProfile.experience_years || 0} yrs • Joined {viewingProfile.joining_date}</p></div>
                <div><span className="text-gray-500">Weekly Load:</span><p className="font-semibold">{viewingProfile.weekly_periods || 0} periods</p></div>
                <div><span className="text-gray-500">Phone:</span><p className="font-semibold">{viewingProfile.phone}</p></div>
                <div><span className="text-gray-500">Email:</span><p className="font-semibold">{viewingProfile.email || "N/A"}</p></div>
              </div>
            </div>
            <div className="border-t bg-gray-50 p-4 flex items-center justify-between">
              <button onClick={() => handleDelete(viewingProfile.id, viewingProfile.full_name)} className="text-xs font-semibold text-rose-600 hover:text-rose-800">Delete Profile</button>
              <div className="flex gap-2">
                <button onClick={() => setViewingProfile(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100">Close</button>
                <button onClick={() => handleOpenEdit(viewingProfile)} className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800">Edit Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal — single-scroll, controlled state, fields preserved on error */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden">
            <div className="flex items-center justify-between bg-teal-800 px-6 py-4 text-white">
              <div>
                <h3 className="text-lg font-bold">{editingTeacher ? `Edit: ${editingTeacher.full_name}` : "Add Teacher Profile"}</h3>
                <p className="text-xs text-teal-100">All fields are preserved even if an error occurs. Required fields are marked *</p>
              </div>
              <button type="button" onClick={handleCloseModal} className="rounded-lg p-1.5 text-teal-200 hover:bg-teal-700">✕</button>
            </div>

            <form
              action={(formData) => {
                if (formValues.full_name.trim().length < 2) {
                  setClientError("Full name must be at least 2 characters.");
                  return;
                }
                setClientError(null);
                formAction(formData);
              }}
              className="p-6 space-y-4 max-h-[78vh] overflow-y-auto"
            >
              <input type="hidden" name="role" value="teacher" />
              {editingTeacher && <input type="hidden" name="id" value={editingTeacher.id} />}
              {editingTeacher?.employee_id && (
                <input type="hidden" name="employee_id" value={editingTeacher.employee_id} />
              )}

              {clientError && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  ⚠️ {clientError}
                </div>
              )}
              <FeedbackAlert state={state} />

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Teacher Name (English) *</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formValues.full_name}
                    onChange={handleFieldChange}
                    placeholder="e.g. Dr. Kazi Mahbubur Rahman"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Teacher Name (বাংলা)</label>
                  <input
                    type="text"
                    name="bangla_name"
                    value={formValues.bangla_name}
                    onChange={handleFieldChange}
                    placeholder="e.g. ড. কাজী মাহবুবুর রহমান"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Designation + Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={formValues.designation}
                    onChange={handleFieldChange}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    name="department"
                    value={formValues.department}
                    onChange={handleFieldChange}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    {departments.filter((d) => d !== "all").map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formValues.phone}
                    onChange={handleFieldChange}
                    placeholder="+880 1711-XXXXXX"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleFieldChange}
                    placeholder="teacher@college.edu.bd"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Highest Degree + Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Highest Degree *</label>
                  <input
                    type="text"
                    name="highest_degree"
                    required
                    value={formValues.highest_degree}
                    onChange={handleFieldChange}
                    placeholder="e.g. M.Sc in Physics (DU)"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Graduating Institution</label>
                  <input
                    type="text"
                    name="institution"
                    value={formValues.institution}
                    onChange={handleFieldChange}
                    placeholder="e.g. University of Dhaka"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Gender + Blood Group + Joining Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formValues.gender}
                    onChange={handleFieldChange}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
                  <select
                    name="blood_group"
                    value={formValues.blood_group}
                    onChange={handleFieldChange}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    name="joining_date"
                    required
                    value={formValues.joining_date}
                    onChange={handleFieldChange}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Experience + Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience_years"
                    min={0}
                    value={formValues.experience_years}
                    onChange={handleFieldChange}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Employment Type</label>
                  <select
                    name="employment_type"
                    value={formValues.employment_type}
                    onChange={handleFieldChange}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  >
                    <option value="permanent">Full-time Permanent</option>
                    <option value="contractual">Contractual</option>
                    <option value="part_time">Part-Time</option>
                    <option value="guest">Guest Faculty</option>
                  </select>
                </div>
              </div>

              {/* Photo */}
              <ImageUploadInput
                name="photo_url"
                label="Teacher Profile Photo"
                value={formValues.photo_url}
                onChange={(url) => setFormValues((prev) => ({ ...prev, photo_url: url }))}
                folder="teachers"
                helperText="Upload teacher photo from your device (JPG, PNG, WebP up to 10MB). Photos removed or replaced are automatically deleted from server storage."
              />

              {/* Subjects + Periods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Subjects <span className="text-gray-400 font-normal">(comma separated)</span></label>
                  <input
                    type="text"
                    name="assigned_subjects"
                    value={formValues.assigned_subjects}
                    onChange={handleFieldChange}
                    placeholder="e.g. Physics 1st Paper, Physics 2nd Paper"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Weekly Periods</label>
                  <input
                    type="number"
                    name="weekly_periods"
                    min={0}
                    value={formValues.weekly_periods}
                    onChange={handleFieldChange}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* HOD */}
              <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3">
                <input
                  type="checkbox"
                  id="is_head_modal"
                  name="is_head_of_department"
                  checked={formValues.is_head_of_department}
                  onChange={handleFieldChange}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 cursor-pointer"
                />
                <label htmlFor="is_head_modal" className="text-xs font-semibold text-teal-900 cursor-pointer">
                  Designate as Head of Department (HOD)
                </label>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Biography / Bio</label>
                <textarea
                  name="bio"
                  rows={2}
                  value={formValues.bio}
                  onChange={handleFieldChange}
                  placeholder="Brief academic introduction..."
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                {clientError ? (
                  <p className="text-xs text-red-600 font-medium">⚠️ {clientError}</p>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <SubmitButton label={editingTeacher ? "Update Profile" : "Save Teacher Profile"} />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
