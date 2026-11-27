"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveStudentAction } from "@/features/students/actions";
import type { StudentRecord, BatchRecord, StudentFeedback } from "@/features/students/types";
import ImageUploadInput from "@/components/shared/ImageUploadInput";
import { SubmitButton } from "@/components/admin/website/FormControls";

interface StudentFormProps {
  initialData?: StudentRecord | null;
  batches: BatchRecord[];
  onSuccess?: () => void;
  isModal?: boolean;
}

export default function StudentForm({
  initialData,
  batches,
  onSuccess,
  isModal = false,
}: StudentFormProps) {
  const [state, formAction] = useActionState<StudentFeedback, FormData>(
    async (prev, formData) => {
      const res = await saveStudentAction(prev, formData);
      if (res.success && onSuccess) {
        onSuccess();
      }
      return res;
    },
    {}
  );

  const [fatherUnavailable, setFatherUnavailable] = useState(
    initialData ? !initialData.father_name && !!initialData.guardian_name : false
  );
  const [motherUnavailable, setMotherUnavailable] = useState(
    initialData ? !initialData.mother_name && !!initialData.guardian_name : false
  );

  const [formValues, setFormValues] = useState({
    id: initialData?.id || "",
    student_code: initialData?.student_code || "",
    full_name: initialData?.full_name || "",
    bangla_name: initialData?.bangla_name || "",
    batch_id: initialData?.batch_id || (batches[0]?.id ?? ""),
    study_group: initialData?.study_group || "science",
    roll: initialData?.roll ?? 1,
    section: initialData?.section || "",
    academic_session: initialData?.academic_session || "2025-2026",
    admission_date: initialData?.admission_date ? initialData.admission_date.slice(0, 10) : "",
    registration_number: initialData?.registration_number || "",
    previous_institution: initialData?.previous_institution || "",
    status: initialData?.status || "active",
    gender: initialData?.gender || "male",
    religion: initialData?.religion || "Islam",
    date_of_birth: initialData?.date_of_birth || "",
    blood_group: initialData?.blood_group || "A+",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    permanent_address: initialData?.permanent_address || "",
    father_name: initialData?.father_name || "",
    father_phone: initialData?.father_phone || "",
    mother_name: initialData?.mother_name || "",
    mother_phone: initialData?.mother_phone || "",
    guardian_name: initialData?.guardian_name || "",
    guardian_phone: initialData?.guardian_phone || "",
    guardian_relation: initialData?.guardian_relation || "Father",
    photo_url: initialData?.photo_url || "",
    rfid_card_id: initialData?.rfid_card_id || "",
    rfid_card_data: initialData?.rfid_card_data || "",
    document_url: initialData?.document_url || "",
    document_name: initialData?.document_name || "",
    password: "",
    notes: initialData?.notes || "",
  });

  const [clientError, setClientError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const copyFatherToGuardian = () => {
    setFormValues((prev) => ({
      ...prev,
      guardian_name: prev.father_name,
      guardian_phone: prev.father_phone || prev.phone,
      guardian_relation: "Father",
    }));
  };

  const copyMotherToGuardian = () => {
    setFormValues((prev) => ({
      ...prev,
      guardian_name: prev.mother_name,
      guardian_phone: prev.mother_phone || prev.phone,
      guardian_relation: "Mother",
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError("");
    if (!formValues.full_name.trim() || formValues.full_name.trim().length < 2) {
      e.preventDefault();
      setClientError("Full name must be at least 2 characters.");
      return;
    }
    if (!formValues.batch_id) {
      e.preventDefault();
      setClientError("Please select a batch.");
      return;
    }
    if (!formValues.roll || Number(formValues.roll) < 1) {
      e.preventDefault();
      setClientError("Please enter a valid roll number.");
      return;
    }
    if (!formValues.guardian_name.trim()) {
      e.preventDefault();
      setClientError("Guardian name is required (especially if father or mother is absent).");
      return;
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-xs"
    >
      {/* Notifications */}
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
          <span className="font-bold">✕</span>
          <span>{state.error}</span>
        </div>
      )}

      {clientError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
          <span className="font-bold">✕</span>
          <span>{clientError}</span>
        </div>
      )}

      {state.success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-start gap-2">
          <span className="font-bold">✓</span>
          <span>{state.message}</span>
        </div>
      )}

      {/* Hidden ID */}
      {formValues.id && <input type="hidden" name="id" value={formValues.id} />}

      {/* Section 1: Academic Enrollment */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-base font-bold text-gray-900">1. Academic Enrollment</h3>
          <p className="text-xs text-gray-500">
            Batch, study group, roll number, and student enrollment status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-bold text-gray-800">
              HSC Batch <span className="text-red-500">*</span>
            </label>
            <select
              name="batch_id"
              value={formValues.batch_id}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.exam_year}) — {b.current_year === "second_year" ? "2nd Year" : "1st Year"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">
              Study Group / Stream <span className="text-red-500">*</span>
            </label>
            <select
              name="study_group"
              value={formValues.study_group}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="science">Science</option>
              <option value="business_studies">Business Studies</option>
              <option value="humanities">Humanities</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">
              Roll Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="roll"
              value={formValues.roll}
              onChange={handleChange}
              required
              min={1}
              placeholder="e.g. 101"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Student Status</label>
            <select
              name="status"
              value={formValues.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="active">Active (Enrolled)</option>
              <option value="suspended">Suspended</option>
              <option value="dropped">Dropped / Inactive</option>
              <option value="passed_out">Passed Out (Alumni)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Section / Shift</label>
            <input
              name="section"
              value={formValues.section}
              onChange={handleChange}
              placeholder="e.g. A, B, or Morning"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Academic Session</label>
            <input
              name="academic_session"
              value={formValues.academic_session}
              onChange={handleChange}
              placeholder="e.g. 2025-2026"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-800">
              Student ID / Code
            </label>
            <input
              name="student_code"
              value={formValues.student_code}
              onChange={handleChange}
              placeholder="Auto-generated if left blank (e.g. STU-2026-1042)"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-xs"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">Leave blank to auto-generate.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Admission Date</label>
            <input
              type="date"
              name="admission_date"
              value={formValues.admission_date}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Board Registration Number</label>
            <input
              name="registration_number"
              value={formValues.registration_number}
              onChange={handleChange}
              placeholder="e.g. 2018492019"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-800">Previous School / Institution</label>
            <input
              name="previous_institution"
              value={formValues.previous_institution}
              onChange={handleChange}
              placeholder="e.g. Motijheel Govt. Boys' High School"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Personal Information */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-base font-bold text-gray-900">2. Personal & Contact Details</h3>
          <p className="text-xs text-gray-500">Student full name, gender, contact, and address.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-gray-800">
              Full Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              name="full_name"
              value={formValues.full_name}
              onChange={handleChange}
              required
              placeholder="e.g. Tanvir Ahmed"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Full Name (বাংলা)</label>
            <input
              name="bangla_name"
              value={formValues.bangla_name}
              onChange={handleChange}
              placeholder="যেমন: তানভীর আহমেদ"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Gender</label>
            <select
              name="gender"
              value={formValues.gender}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Blood Group</label>
            <select
              name="blood_group"
              value={formValues.blood_group}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Religion</label>
            <select
              name="religion"
              value={formValues.religion}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="Islam">Islam (ইসলাম)</option>
              <option value="Hinduism">Hinduism (সনাতন / হিন্দু)</option>
              <option value="Buddhism">Buddhism (বৌদ্ধ)</option>
              <option value="Christianity">Christianity (খ্রিস্টান)</option>
              <option value="Other">Other (অন্যান্য)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formValues.date_of_birth}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              placeholder="e.g. 01712345678"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-800">Email Address</label>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              placeholder="e.g. student@college.edu"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-800">Present Address</label>
            <input
              name="address"
              value={formValues.address}
              onChange={handleChange}
              placeholder="House/Road, Area, City"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-800">Permanent Address</label>
            <input
              name="permanent_address"
              value={formValues.permanent_address}
              onChange={handleChange}
              placeholder="Village, Post Office, Upazila, District"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Profile Picture (Simple Direct Upload) */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-base font-bold text-gray-900">3. Student Photo</h3>
          <p className="text-xs text-gray-500">
            Upload student portrait directly from your device (JPG, PNG, WebP up to 10MB).
          </p>
        </div>

        <div className="max-w-md">
          <ImageUploadInput
            name="photo_url"
            value={formValues.photo_url}
            onChange={(url) => setFormValues((prev) => ({ ...prev, photo_url: url }))}
            folder="students"
            label="Student Portrait Photo"
            helperText="Direct image upload with automatic Cloudflare storage hosting."
          />
        </div>
      </div>

      {/* Section 4: Parents & Guardian Details */}
      <div className="space-y-5">
        <div className="border-b pb-2">
          <h3 className="text-base font-bold text-gray-900">4. Parents & Guardian Information</h3>
          <p className="text-xs text-gray-500">
            Family information. If a student has no father or mother, an alternative legal guardian can be designated.
          </p>
        </div>

        {/* Father Information */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-700">Father&apos;s Information</span>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={fatherUnavailable}
                onChange={(e) => {
                  setFatherUnavailable(e.target.checked);
                  if (e.target.checked) {
                    setFormValues((p) => ({ ...p, father_name: "", father_phone: "" }));
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-amber-800">Father is deceased / not available</span>
            </label>
          </div>

          {!fatherUnavailable ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-800">Father&apos;s Full Name</label>
                <input
                  name="father_name"
                  value={formValues.father_name}
                  onChange={handleChange}
                  placeholder="Father's full name"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800">Father&apos;s Contact Phone</label>
                <input
                  type="tel"
                  name="father_phone"
                  value={formValues.father_phone}
                  onChange={handleChange}
                  placeholder="e.g. 01819223344"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex items-center gap-2">
              <span>⚠️</span>
              <span>Father marked as deceased/unavailable. Please ensure a legal guardian is designated below.</span>
            </div>
          )}
        </div>

        {/* Mother Information */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-700">Mother&apos;s Information</span>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={motherUnavailable}
                onChange={(e) => {
                  setMotherUnavailable(e.target.checked);
                  if (e.target.checked) {
                    setFormValues((p) => ({ ...p, mother_name: "", mother_phone: "" }));
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-amber-800">Mother is deceased / not available</span>
            </label>
          </div>

          {!motherUnavailable ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-800">Mother&apos;s Full Name</label>
                <input
                  name="mother_name"
                  value={formValues.mother_name}
                  onChange={handleChange}
                  placeholder="Mother's full name"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800">Mother&apos;s Contact Phone</label>
                <input
                  type="tel"
                  name="mother_phone"
                  value={formValues.mother_phone}
                  onChange={handleChange}
                  placeholder="e.g. 01911556677"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex items-center gap-2">
              <span>⚠️</span>
              <span>Mother marked as deceased/unavailable. Please ensure a legal guardian is designated below.</span>
            </div>
          )}
        </div>

        {/* Primary / Legal Guardian Card */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-blue-900">
                👨‍👧 Primary / Legal Guardian (Required) <span className="text-red-500">*</span>
              </span>
              <p className="text-[11px] text-blue-700 mt-0.5">
                The person responsible for institutional correspondence and emergency decisions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!fatherUnavailable && formValues.father_name && (
                <button
                  type="button"
                  onClick={copyFatherToGuardian}
                  className="rounded bg-white border border-blue-300 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 shadow-2xs"
                >
                  Use Father as Guardian
                </button>
              )}
              {!motherUnavailable && formValues.mother_name && (
                <button
                  type="button"
                  onClick={copyMotherToGuardian}
                  className="rounded bg-white border border-blue-300 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 shadow-2xs"
                >
                  Use Mother as Guardian
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-gray-800">
                Guardian Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="guardian_name"
                value={formValues.guardian_name}
                onChange={handleChange}
                required
                placeholder="Full name of guardian"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800">
                Guardian Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="guardian_phone"
                value={formValues.guardian_phone}
                onChange={handleChange}
                required
                placeholder="Emergency contact number"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800">
                Relationship to Student <span className="text-red-500">*</span>
              </label>
              <select
                name="guardian_relation"
                value={formValues.guardian_relation}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Grandfather">Grandfather (Dada / Nana)</option>
                <option value="Grandmother">Grandmother (Dadi / Nani)</option>
                <option value="Uncle">Uncle (Chacha / Mama)</option>
                <option value="Aunt">Aunt (Fupu / Khala)</option>
                <option value="Elder Brother">Elder Brother</option>
                <option value="Elder Sister">Elder Sister</option>
                <option value="Legal Guardian">Legal Guardian / Custodian</option>
                <option value="Orphanage / Welfare">Orphanage / Welfare Organization</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Hardware & Notes */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-base font-bold text-gray-900">
            5. Hardware RFID & Notes
          </h3>
          <p className="text-xs text-gray-500">
            Optional hardware identifier for your ESP RFID scanner device.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-gray-800">
              RFID Card / Tag UID (Optional)
            </label>
            <input
              name="rfid_card_id"
              value={formValues.rfid_card_id}
              onChange={handleChange}
              placeholder="e.g. RFID-94821 or 4-byte HEX UID"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-xs"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Ready for your ESP RFID hardware device. You can link this now or later.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">
              RFID Card Data / Payload (Optional)
            </label>
            <input
              name="rfid_card_data"
              value={formValues.rfid_card_data}
              onChange={handleChange}
              placeholder="Hardware card data string"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">
              Student Document Name (Optional)
            </label>
            <input
              name="document_name"
              value={formValues.document_name}
              onChange={handleChange}
              placeholder="e.g. HSC Registration Slip / Transcript"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">
              Student Document File URL (Optional)
            </label>
            <input
              name="document_url"
              value={formValues.document_url}
              onChange={handleChange}
              placeholder="e.g. /uploads/documents/std-transcript.pdf or URL"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-800">
              Administrative Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formValues.notes}
              onChange={handleChange}
              placeholder="e.g. Scholarship recipient, Olympiad winner, etc."
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 6: Student Portal Credentials */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-base font-bold text-gray-900">
            6. Student Portal Authentication
          </h3>
          <p className="text-xs text-gray-500">
            Set or reset password for the student to sign in at <code>/student/login</code>.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
          {initialData?.id && (
            <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                Current Student Password:
              </span>
              <span className="font-mono text-sm font-bold text-amber-950 mt-1 block">
                {initialData.current_password || (initialData.has_password ? "Custom (Encrypted)" : "student123 (Default)")}
              </span>
            </div>
          )}

          <div className="max-w-md">
            <label className="block text-xs font-bold text-gray-800">
              {formValues.id ? "Set New Password (Leave blank to keep current)" : "Initial Password (Optional)"}
            </label>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder={formValues.id ? "Enter new password (min 6 characters)" : "Defaults to student123 or Student ID"}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-gray-500 mt-1.5">
              Passwords are cryptographically hashed using bcrypt (10 rounds). Plaintext passwords are never stored.
            </p>
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-between pt-4 border-t">
        {!isModal && (
          <Link
            href="/admin/students/list"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-xs"
          >
            ← Back to Student Directory
          </Link>
        )}
        <div className="ml-auto flex items-center gap-3">
          <SubmitButton label={initialData?.id ? "Update Student Profile" : "Save Student Profile"} />
        </div>
      </div>
    </form>
  );
}
