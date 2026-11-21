"use client";

import { useState, useActionState, useEffect } from "react";
import type { StaffProfileRecord, StaffFeedback } from "@/features/staff/types";
import {
  saveStaffProfileAction,
  deleteStaffProfileAction,
  toggleStaffStatusAction,
} from "@/features/staff/actions";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

const DEPARTMENTS = [
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
  "Sociology",
  "History & Islamic History",
  "Administration",
  "Library",
  "Accounts & Finance",
  "IT & Media",
  "General Office",
];

interface StaffFormData {
  full_name: string;
  bangla_name: string;
  role: "teacher" | "staff";
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
  status: "active" | "on_leave" | "suspended" | "retired";
  photo_url: string;
  assigned_subjects: string;
  assigned_classes: string;
  weekly_periods: number;
  is_head_of_department: boolean;
  is_class_teacher: boolean;
  class_teacher_section: string;
  bio: string;
  present_address: string;
  permanent_address: string;
}

const DEFAULT_FORM: StaffFormData = {
  full_name: "",
  bangla_name: "",
  role: "teacher",
  designation: "",
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
  status: "active",
  photo_url: "",
  assigned_subjects: "",
  assigned_classes: "",
  weekly_periods: 18,
  is_head_of_department: false,
  is_class_teacher: false,
  class_teacher_section: "",
  bio: "",
  present_address: "",
  permanent_address: "",
};

export default function StaffListManager({
  initialStaff,
  initialEditId,
  startCreate = false,
}: {
  initialStaff: StaffProfileRecord[];
  initialEditId?: string;
  startCreate?: boolean;
}) {
  const [staffList, setStaffList] = useState<StaffProfileRecord[]>(initialStaff);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("" );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(
    Boolean(startCreate || initialEditId)
  );
  const [editingStaff, setEditingStaff] = useState<StaffProfileRecord | null>(() => {
    if (initialEditId) {
      return initialStaff.find((s) => s.id === initialEditId) || null;
    }
    return null;
  });

  const [formValues, setFormValues] = useState<StaffFormData>(DEFAULT_FORM);
  const [clientError, setClientError] = useState<string | null>(null);

  const [state, formAction] = useActionState<StaffFeedback, FormData>(
    saveStaffProfileAction,
    {}
  );
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  // When editingStaff changes, populate formValues
  useEffect(() => {
    if (editingStaff) {
      setFormValues({
        full_name: editingStaff.full_name || "",
        bangla_name: editingStaff.bangla_name || "",
        role: editingStaff.role || "teacher",
        designation: editingStaff.designation || "",
        department: editingStaff.department || "Physics",
        phone: editingStaff.phone || "",
        email: editingStaff.email || "",
        highest_degree: editingStaff.highest_degree || "",
        institution: editingStaff.institution || "",
        gender: editingStaff.gender || "male",
        blood_group: editingStaff.blood_group || "A+",
        joining_date: editingStaff.joining_date || new Date().toISOString().split("T")[0],
        experience_years: editingStaff.experience_years || 0,
        employment_type: editingStaff.employment_type || "permanent",
        status: editingStaff.status || "active",
        photo_url: editingStaff.photo_url || "",
        assigned_subjects: editingStaff.assigned_subjects?.join(", ") || "",
        assigned_classes: editingStaff.assigned_classes?.join(", ") || "",
        weekly_periods: editingStaff.weekly_periods || 18,
        is_head_of_department: editingStaff.is_head_of_department || false,
        is_class_teacher: editingStaff.is_class_teacher || false,
        class_teacher_section: editingStaff.class_teacher_section || "",
        bio: editingStaff.bio || "",
        present_address: editingStaff.present_address || "",
        permanent_address: editingStaff.permanent_address || "",
      });
    } else {
      setFormValues(DEFAULT_FORM);
    }
    setClientError(null);
  }, [editingStaff]);

  // Handle successful save
  useEffect(() => {
    if (state.success && state.message) {
      setDeleteMsg(state.message);
      // If was editing, update locally
      if (editingStaff) {
        setStaffList((prev) =>
          prev.map((s) =>
            s.id === editingStaff.id
              ? {
                  ...s,
                  ...formValues,
                  assigned_subjects: formValues.assigned_subjects.split(",").map((x) => x.trim()).filter(Boolean),
                  assigned_classes: formValues.assigned_classes.split(",").map((x) => x.trim()).filter(Boolean),
                }
              : s
          )
        );
      }
      setIsModalOpen(false);
      setEditingStaff(null);
    }
  }, [state]);

  // Filtered view
  const filtered = staffList.filter((item) => {
    if (roleFilter !== "all" && item.role !== roleFilter) return false;
    if (deptFilter !== "all" && item.department.toLowerCase() !== deptFilter.toLowerCase())
      return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const match =
        item.full_name.toLowerCase().includes(s) ||
        (item.bangla_name && item.bangla_name.includes(s)) ||
        item.employee_id.toLowerCase().includes(s) ||
        item.department.toLowerCase().includes(s) ||
        item.designation.toLowerCase().includes(s) ||
        item.phone.includes(s) ||
        item.email.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  function handleOpenCreate() {
    setEditingStaff(null);
    setFormValues(DEFAULT_FORM);
    setClientError(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(staff: StaffProfileRecord) {
    setEditingStaff(staff);
    setClientError(null);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    // If a photo was uploaded in this session but not saved, automatically delete it from storage
    if (formValues.photo_url && formValues.photo_url.startsWith("/uploads/") && formValues.photo_url !== editingStaff?.photo_url) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formValues.photo_url }),
      }).catch(() => {});
    }

    setIsModalOpen(false);
    setEditingStaff(null);
    setClientError(null);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove the profile for ${name}?`)) return;
    const res = await deleteStaffProfileAction(id);
    if (res.error) {
      alert(`Error: ${res.error}`);
    } else {
      setDeleteMsg(`Profile for ${name} deleted successfully.`);
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    }
  }

  async function handleToggleStatus(
    id: string,
    newStatus: "active" | "on_leave" | "suspended" | "retired"
  ) {
    const res = await toggleStaffStatusAction(id, newStatus);
    if (res.error) {
      alert(`Error: ${res.error}`);
    } else {
      setStaffList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    }
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
      {/* Top Banner & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add / Edit / Remove Staff</h1>
          <p className="text-xs text-gray-500 mt-1">
            Maintain the comprehensive staff directory, register new teachers or support staff, and update credentials.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-teal-800"
        >
          <span className="text-base font-bold">+</span> Add Staff / Teacher Profile
        </button>
      </div>

      {deleteMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✅ {deleteMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search Personnel</label>
            <input
              type="text"
              placeholder="Search by name, ID, phone, email, designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role / Type</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Personnel</option>
              <option value="teacher">Teaching Faculty</option>
              <option value="staff">Administrative / Support Staff</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="suspended">Suspended</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
          <span>
            Showing <strong className="text-gray-900">{filtered.length}</strong> of {staffList.length} total personnel
          </span>
          {(roleFilter !== "all" || deptFilter !== "all" || statusFilter !== "all" || searchTerm) && (
            <button
              onClick={() => {
                setRoleFilter("all");
                setDeptFilter("all");
                setStatusFilter("all");
                setSearchTerm("");
              }}
              className="font-medium text-teal-600 hover:text-teal-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5">ID & Name</th>
                <th className="px-4 py-3.5">Designation & Role</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Qualifications</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No staff members match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-800 text-xs">
                          {staff.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={staff.photo_url}
                              alt={staff.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            staff.full_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{staff.full_name}</div>
                          {staff.bangla_name && (
                            <div className="text-xs text-gray-500">{staff.bangla_name}</div>
                          )}
                          <span className="inline-block mt-0.5 text-[11px] font-mono font-medium text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded">
                            {staff.employee_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900">{staff.designation}</div>
                      <span
                        className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-1 ${
                          staff.role === "teacher"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {staff.role === "teacher" ? "Faculty" : "Staff"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-800">{staff.department}</div>
                      {staff.is_head_of_department && (
                        <span className="inline-block text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded mt-1">
                          HOD (Dept Head)
                        </span>
                      )}
                      {staff.is_class_teacher && (
                        <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                          CT: {staff.class_teacher_section}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-medium text-gray-800">{staff.phone}</div>
                      <div className="text-gray-500">{staff.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-medium text-gray-900">{staff.highest_degree}</div>
                      {staff.institution && (
                        <div className="text-gray-500 text-[11px]">{staff.institution}</div>
                      )}
                      <div className="text-gray-400 text-[10px] mt-0.5">
                        Exp: {staff.experience_years || 0} yrs • Joined {staff.joining_date}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={staff.status}
                        onChange={(e) =>
                          handleToggleStatus(
                            staff.id,
                            e.target.value as "active" | "on_leave" | "suspended" | "retired"
                          )
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold border focus:outline-none ${
                          staff.status === "active"
                            ? "bg-green-50 text-green-800 border-green-200"
                            : staff.status === "on_leave"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-gray-50 text-gray-800 border-gray-200"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="suspended">Suspended</option>
                        <option value="retired">Retired</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(staff)}
                        className="rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 mr-1.5 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id, staff.full_name)}
                        className="rounded bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Profile Modal — Single Unified Form, No Tabs, Controlled Inputs */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-teal-800 px-6 py-4 text-white">
              <div>
                <h3 className="text-lg font-bold">
                  {editingStaff ? `Edit Profile: ${editingStaff.full_name}` : "Add New Staff / Teacher Profile"}
                </h3>
                <p className="text-xs text-teal-100">
                  All fields are preserved even if an error occurs. Required fields are marked *.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-teal-200 hover:bg-teal-700 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              action={(formData) => {
                if (formValues.full_name.trim().length < 2) {
                  setClientError("Full name must be at least 2 characters.");
                  return;
                }
                setClientError(null);
                formAction(formData);
              }}
              className="p-6 space-y-6 max-h-[78vh] overflow-y-auto"
            >
              {editingStaff && <input type="hidden" name="id" value={editingStaff.id} />}
              {editingStaff?.employee_id && (
                <input type="hidden" name="employee_id" value={editingStaff.employee_id} />
              )}

              {clientError && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  ⚠️ {clientError}
                </div>
              )}
              <FeedbackAlert state={state} />

              {/* ── Section 1: Basic Information ── */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-teal-100 pb-1 mb-3">
                  1. Basic Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Name (English) *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        required
                        value={formValues.full_name}
                        onChange={handleFieldChange}
                        placeholder="e.g. Dr. Kazi Mahbubur Rahman"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Name (বাংলা)
                      </label>
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Role Type *</label>
                      <select
                        name="role"
                        value={formValues.role}
                        onChange={handleFieldChange}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      >
                        <option value="teacher">Teaching Faculty</option>
                        <option value="staff">Administrative / Support Staff</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Designation *</label>
                      <input
                        type="text"
                        name="designation"
                        required
                        value={formValues.designation}
                        onChange={handleFieldChange}
                        placeholder="e.g. Associate Professor"
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
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Contact & Personal ── */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-teal-100 pb-1 mb-3">
                  2. Contact & Personal Details
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        placeholder="staff@college.edu.bd"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Present Address</label>
                      <textarea
                        name="present_address"
                        rows={2}
                        value={formValues.present_address}
                        onChange={handleFieldChange}
                        placeholder="House, Road, Area, City"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Permanent Address</label>
                      <textarea
                        name="permanent_address"
                        rows={2}
                        value={formValues.permanent_address}
                        onChange={handleFieldChange}
                        placeholder="Village, Post, Thana, District"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 3: Academic Qualifications & Employment ── */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-teal-100 pb-1 mb-3">
                  3. Academic Qualifications & Status
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Highest Degree *</label>
                      <input
                        type="text"
                        name="highest_degree"
                        required
                        value={formValues.highest_degree}
                        onChange={handleFieldChange}
                        placeholder="e.g. M.Sc in Physics, B.Sc (Hons)"
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formValues.status}
                        onChange={handleFieldChange}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      >
                        <option value="active">Active (On Duty)</option>
                        <option value="on_leave">On Leave</option>
                        <option value="suspended">Suspended</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 4: Profile Picture ── */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-teal-100 pb-1 mb-3">
                  4. Profile Picture
                </h4>
                <ImageUploadInput
                  name="photo_url"
                  label="Staff / Teacher Photo"
                  value={formValues.photo_url}
                  onChange={(url) => setFormValues((prev) => ({ ...prev, photo_url: url }))}
                  folder="staff"
                  helperText="Upload employee photo directly from your device (JPG, PNG, WebP up to 10MB). Photos removed or replaced are automatically deleted from server storage."
                />
              </div>

              {/* ── Section 5: Teaching Duties & Load (For Teachers) ── */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-teal-100 pb-1 mb-3">
                  5. Teaching Duties & Responsibilities
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Assigned Subjects <span className="text-gray-400 font-normal">(comma separated)</span>
                      </label>
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Assigned Classes / Batches <span className="text-gray-400 font-normal">(comma separated)</span>
                      </label>
                      <input
                        type="text"
                        name="assigned_classes"
                        value={formValues.assigned_classes}
                        onChange={handleFieldChange}
                        placeholder="e.g. XI Science A, XII Science B"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Weekly Teaching Periods</label>
                      <input
                        type="number"
                        name="weekly_periods"
                        min={0}
                        value={formValues.weekly_periods}
                        onChange={handleFieldChange}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-2">
                        <input
                          type="checkbox"
                          id="is_head_of_department"
                          name="is_head_of_department"
                          checked={formValues.is_head_of_department}
                          onChange={handleFieldChange}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <label htmlFor="is_head_of_department" className="text-xs font-semibold text-teal-900 cursor-pointer">
                          Head of Department (HOD)
                        </label>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-2">
                        <input
                          type="checkbox"
                          id="is_class_teacher"
                          name="is_class_teacher"
                          checked={formValues.is_class_teacher}
                          onChange={handleFieldChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_class_teacher" className="text-xs font-semibold text-indigo-900 cursor-pointer">
                          Appoint as Class Teacher
                        </label>
                      </div>
                    </div>
                  </div>

                  {formValues.is_class_teacher && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Class Teacher Section:
                      </label>
                      <input
                        type="text"
                        name="class_teacher_section"
                        value={formValues.class_teacher_section}
                        onChange={handleFieldChange}
                        placeholder="e.g. Class XI - Science A"
                        className="w-full sm:w-72 rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Biography / Summary</label>
                    <textarea
                      name="bio"
                      rows={2}
                      value={formValues.bio}
                      onChange={handleFieldChange}
                      placeholder="A short introduction or background..."
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                {clientError ? (
                  <p className="text-xs text-red-600 font-medium">⚠️ {clientError}</p>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <SubmitButton label={editingStaff ? "Update Profile" : "Save Profile"} />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
