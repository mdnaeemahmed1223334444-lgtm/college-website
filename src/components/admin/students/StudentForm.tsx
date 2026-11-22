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

  const [formValues, setFormValues] = useState({
    id: initialData?.id || "",
    student_code: initialData?.student_code || "",
    full_name: initialData?.full_name || "",
    bangla_name: initialData?.bangla_name || "",
    batch_id: initialData?.batch_id || (batches[0]?.id ?? ""),
    study_group: initialData?.study_group || "science",
    roll: initialData?.roll ?? 1,
    section: initialData?.section || "A",
    status: initialData?.status || "active",
    gender: initialData?.gender || "male",
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
    notes: initialData?.notes || "",
  });

  const [clientError, setClientError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
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
            Batch, study stream, roll, section, and current student status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            <label className="block text-xs font-bold text-gray-800">Section</label>
            <input
              name="section"
              value={formValues.section}
              onChange={handleChange}
              placeholder="e.g. A, B, or C"
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
            <label className="block text-xs font-bold text-gray-800">
              Student ID / Code
            </label>
            <input
              name="student_code"
              value={formValues.student_code}
              onChange={handleChange}
              placeholder="Auto-generated if left blank"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none font-mono text-xs"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">Leave blank to auto-generate.</p>
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
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-base font-bold text-gray-900">4. Parents & Guardian Information</h3>
          <p className="text-xs text-gray-500">Emergency contact and family details.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-gray-800">Father&apos;s Name</label>
            <input
              name="father_name"
              value={formValues.father_name}
              onChange={handleChange}
              placeholder="Father's full name"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Father&apos;s Phone</label>
            <input
              type="tel"
              name="father_phone"
              value={formValues.father_phone}
              onChange={handleChange}
              placeholder="e.g. 01819223344"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Mother&apos;s Name</label>
            <input
              name="mother_name"
              value={formValues.mother_name}
              onChange={handleChange}
              placeholder="Mother's full name"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Mother&apos;s Phone</label>
            <input
              type="tel"
              name="mother_phone"
              value={formValues.mother_phone}
              onChange={handleChange}
              placeholder="e.g. 01911556677"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Guardian Name</label>
            <input
              name="guardian_name"
              value={formValues.guardian_name}
              onChange={handleChange}
              placeholder="Primary guardian for correspondence"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Guardian Phone</label>
            <input
              type="tel"
              name="guardian_phone"
              value={formValues.guardian_phone}
              onChange={handleChange}
              placeholder="Emergency contact number"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">Relationship to Student</label>
            <input
              name="guardian_relation"
              value={formValues.guardian_relation}
              onChange={handleChange}
              placeholder="e.g. Father, Mother, Uncle"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
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
