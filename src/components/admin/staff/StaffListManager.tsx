"use client";

import { useState, useActionState } from "react";
import type { StaffProfileRecord, StaffFeedback } from "@/features/staff/types";
import {
  saveStaffProfileAction,
  deleteStaffProfileAction,
  toggleStaffStatusAction,
} from "@/features/staff/actions";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";

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
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(
    Boolean(startCreate || initialEditId)
  );
  const [activeTab, setActiveTab] = useState<"basic" | "contact" | "academic" | "assignments">("basic");
  const [editingStaff, setEditingStaff] = useState<StaffProfileRecord | null>(() => {
    if (initialEditId) {
      return initialStaff.find((s) => s.id === initialEditId) || null;
    }
    return null;
  });

  const [state, formAction] = useActionState<StaffFeedback, FormData>(
    saveStaffProfileAction,
    {}
  );
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

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
    setActiveTab("basic");
    setIsModalOpen(true);
  }

  function handleOpenEdit(staff: StaffProfileRecord) {
    setEditingStaff(staff);
    setActiveTab("basic");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingStaff(null);
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
                      {staff.room_number && (
                        <div className="text-gray-400 text-[11px]">📍 {staff.room_number}</div>
                      )}
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

      {/* Add / Edit Profile Modal */}
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
                  Fill in the details below. Non-technical inputs with instant preview.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-teal-200 hover:bg-teal-700 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-6">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
                  activeTab === "basic"
                    ? "border-teal-600 text-teal-800"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                1. Basic Info & Role
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contact")}
                className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
                  activeTab === "contact"
                    ? "border-teal-600 text-teal-800"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                2. Contact & Personal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("academic")}
                className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
                  activeTab === "academic"
                    ? "border-teal-600 text-teal-800"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                3. Qualifications & Bio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("assignments")}
                className={`border-b-2 py-3 px-4 text-xs font-semibold transition ${
                  activeTab === "assignments"
                    ? "border-teal-600 text-teal-800"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                4. Workload & Classes
              </button>
            </div>

            {/* Modal Form */}
            <form action={formAction} className="p-6">
              {editingStaff && <input type="hidden" name="id" value={editingStaff.id} />}
              <FeedbackAlert state={state} />

              {/* Tab 1: Basic Info & Role */}
              {activeTab === "basic" && (
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
                        defaultValue={editingStaff?.full_name || ""}
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
                        defaultValue={editingStaff?.bangla_name || ""}
                        placeholder="e.g. ড. কাজী মাহবুবুর রহমান"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Role Type *</label>
                      <select
                        name="role"
                        defaultValue={editingStaff?.role || "teacher"}
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
                        defaultValue={editingStaff?.designation || ""}
                        placeholder="e.g. Associate Professor"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Employee ID (Optional)
                      </label>
                      <input
                        type="text"
                        name="employee_id"
                        defaultValue={editingStaff?.employee_id || ""}
                        placeholder="Leave blank to auto-generate"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                      <select
                        name="department"
                        defaultValue={editingStaff?.department || "Physics"}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Profile Photo URL
                      </label>
                      <input
                        type="url"
                        name="photo_url"
                        defaultValue={editingStaff?.photo_url || ""}
                        placeholder="https://example.com/photo.jpg"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Room / Office Location
                      </label>
                      <input
                        type="text"
                        name="room_number"
                        defaultValue={editingStaff?.room_number || ""}
                        placeholder="e.g. Science Lab Complex, Room 204"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Display Priority Order</label>
                      <input
                        type="number"
                        name="display_order"
                        defaultValue={editingStaff?.display_order || 0}
                        placeholder="0"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveTab("contact")}
                      className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                    >
                      Next: Contact & Personal &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Contact & Personal */}
              {activeTab === "contact" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={editingStaff?.email || ""}
                        placeholder="teacher@college.edu.bd"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="text"
                        name="phone"
                        required
                        defaultValue={editingStaff?.phone || ""}
                        placeholder="+880 1711-XXXXXX"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
                      <select
                        name="gender"
                        defaultValue={editingStaff?.gender || "male"}
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
                        defaultValue={editingStaff?.blood_group || "A+"}
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        defaultValue={editingStaff?.date_of_birth || ""}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">National ID (NID)</label>
                    <input
                      type="text"
                      name="nid"
                      defaultValue={editingStaff?.nid || ""}
                      placeholder="e.g. 1985269000101001"
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Present Address</label>
                      <textarea
                        name="present_address"
                        rows={2}
                        defaultValue={editingStaff?.present_address || ""}
                        placeholder="House, Road, Area, City"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Permanent Address</label>
                      <textarea
                        name="permanent_address"
                        rows={2}
                        defaultValue={editingStaff?.permanent_address || ""}
                        placeholder="Village, Post, Thana, District"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab("basic")}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("academic")}
                      className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                    >
                      Next: Qualifications & Bio &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Qualifications & Bio */}
              {activeTab === "academic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Highest Degree & Subject *
                      </label>
                      <input
                        type="text"
                        name="highest_degree"
                        required
                        defaultValue={editingStaff?.highest_degree || ""}
                        placeholder="e.g. M.Sc in Physics, B.Sc (Hons)"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Graduating University / Institution
                      </label>
                      <input
                        type="text"
                        name="institution"
                        defaultValue={editingStaff?.institution || ""}
                        placeholder="e.g. University of Dhaka"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Academic Specialization / Research Area
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      defaultValue={editingStaff?.specialization || ""}
                      placeholder="e.g. Quantum Mechanics, Nuclear Physics & Electronics"
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="experience_years"
                        defaultValue={editingStaff?.experience_years || 0}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Joining Date *</label>
                      <input
                        type="date"
                        name="joining_date"
                        required
                        defaultValue={
                          editingStaff?.joining_date || new Date().toISOString().split("T")[0]
                        }
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Employment Type</label>
                      <select
                        name="employment_type"
                        defaultValue={editingStaff?.employment_type || "permanent"}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      >
                        <option value="permanent">Full-time Permanent</option>
                        <option value="contractual">Contractual</option>
                        <option value="part_time">Part-Time</option>
                        <option value="guest">Guest Faculty</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Teacher Bio / Summary
                    </label>
                    <textarea
                      name="bio"
                      rows={3}
                      defaultValue={editingStaff?.bio || ""}
                      placeholder="A short description of teaching experience, achievements, and contributions..."
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab("contact")}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("assignments")}
                      className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                    >
                      Next: Workload & Classes &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: Workload & Classes */}
              {activeTab === "assignments" && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_head_of_department"
                        name="is_head_of_department"
                        value="true"
                        defaultChecked={editingStaff?.is_head_of_department || false}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="is_head_of_department" className="text-xs font-semibold text-teal-900">
                        Designate as Head of Department (HOD)
                      </label>
                    </div>
                    <p className="text-[11px] text-teal-700 ml-6 mt-0.5">
                      Check this box if this faculty member is currently the head of their academic department.
                    </p>
                  </div>

                  <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_class_teacher"
                        name="is_class_teacher"
                        value="true"
                        defaultChecked={editingStaff?.is_class_teacher || false}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="is_class_teacher" className="text-xs font-semibold text-indigo-900">
                        Appoint as Class Teacher
                      </label>
                    </div>
                    <div className="ml-6 mt-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Class Teacher of Section:
                      </label>
                      <input
                        type="text"
                        name="class_teacher_section"
                        defaultValue={editingStaff?.class_teacher_section || ""}
                        placeholder="e.g. Class XI - Science A"
                        className="w-full sm:w-72 rounded-lg border border-gray-300 p-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Assigned Subjects (comma separated)
                      </label>
                      <input
                        type="text"
                        name="assigned_subjects"
                        defaultValue={editingStaff?.assigned_subjects?.join(", ") || ""}
                        placeholder="e.g. Physics 1st Paper, Physics 2nd Paper, Practical"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                      <span className="text-[11px] text-gray-500">Separate subjects with commas</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Assigned Classes / Batches (comma separated)
                      </label>
                      <input
                        type="text"
                        name="assigned_classes"
                        defaultValue={editingStaff?.assigned_classes?.join(", ") || ""}
                        placeholder="e.g. XI Science A, XI Science B, XII Science A"
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                      <span className="text-[11px] text-gray-500">Separate sections with commas</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Weekly Teaching Periods (Periods/Week)
                      </label>
                      <input
                        type="number"
                        name="weekly_periods"
                        defaultValue={editingStaff?.weekly_periods || 18}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Status *</label>
                      <select
                        name="status"
                        defaultValue={editingStaff?.status || "active"}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                      >
                        <option value="active">Active (On Duty)</option>
                        <option value="on_leave">On Leave</option>
                        <option value="suspended">Suspended</option>
                        <option value="retired">Retired</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab("academic")}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      &larr; Back
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <SubmitButton label={editingStaff ? "Update Profile" : "Save Profile"} />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
