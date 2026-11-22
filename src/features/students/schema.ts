import { z } from "zod";

const safeString = (defaultVal = "") =>
  z
    .preprocess((val) => (val === null || val === undefined ? defaultVal : String(val)), z.string().trim())
    .default(defaultVal);

const optionalString = z
  .preprocess((val) => {
    if (val === null || val === undefined) return undefined;
    const s = String(val).trim();
    return s.length > 0 ? s : undefined;
  }, z.string().optional());

export const studentSchema = z.object({
  id: z.string().uuid().optional(),
  student_code: safeString(""),
  full_name: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().trim().min(2, "Full name must be at least 2 characters")
  ),
  bangla_name: optionalString,
  batch_id: z.string().min(1, "Batch is required"),
  study_group: z.enum(["science", "business_studies", "humanities"], {
    errorMap: () => ({ message: "Please select a valid study group" }),
  }),
  roll: z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return 1;
    const n = Number(val);
    return isNaN(n) ? 1 : n;
  }, z.number().int().min(1, "Roll number must be a positive integer")),
  section: optionalString,
  status: z.enum(["active", "suspended", "dropped", "passed_out"]).default("active"),
  gender: z.enum(["male", "female", "other"]).default("male"),
  date_of_birth: optionalString,
  blood_group: optionalString,
  phone: optionalString,
  email: z.preprocess((val) => {
    if (!val || val === "null") return undefined;
    const s = String(val).trim();
    return s.length > 0 ? s : undefined;
  }, z.string().email("Please enter a valid email address").optional()),
  address: optionalString,
  permanent_address: optionalString,
  father_name: optionalString,
  father_phone: optionalString,
  mother_name: optionalString,
  mother_phone: optionalString,
  guardian_name: optionalString,
  guardian_phone: optionalString,
  guardian_relation: optionalString,
  photo_url: optionalString,
  rfid_card_id: optionalString,
  notes: optionalString,
});

export const batchSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Batch name is required"),
  exam_year: z.preprocess((val) => Number(val), z.number().int().min(2000).max(2100)),
  status: z.enum(["running", "passed"]).default("running"),
  current_year: z.enum(["first_year", "second_year"]).optional(),
});
