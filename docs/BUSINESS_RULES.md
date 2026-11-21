# BUSINESS_RULES.md: students, batches, roles (decided with the owner)

## Batches
- A **batch** = one HSC exam-year group, named like `HSC Batch 26` (exam_year 2026). Table: `batches`.
- **Status**: `running` or `passed`. Admin can change it any time.
- A **running** batch is in `first_year` (1st year) or `second_year` (2nd year). Admin promotes 1st -> 2nd by changing the year.
- A **passed** batch has no current year. Setting a batch to passed makes its active students `passed_out`; setting it back to running re-activates them.
- DB function: `set_batch_status(batch, status, year)`.

## Groups
- Every student has exactly one group: `science`, `business_studies`, or `humanities`. Admin can change it at any time.

## Students
- A student belongs to ONE batch + ONE group. Admin adds students **separately per batch** (and group).
- Admin can edit **everything** about a student (details, batch, group, status, roll, account).
- Student statuses: `active`, `suspended`, `dropped`, `passed_out`.

## Transfer (student did not pass / could not sit HSC in his batch)
- Admin moves the student to another **running** batch (and optionally a new group). New roll is optional (null clears it to avoid clashes).
- Transfer makes the student `active` again.
- Every transfer / group change is logged in `student_history` (who, when, from, to, reason).
- DB function: `transfer_student(student, to_batch, to_group, new_roll, reason, actor)`; atomic.

## Who can do what
| Role | Students | Everything else |
|---|---|---|
| Admin | Read + write all (add, edit, delete, transfer, change group, change batch status) | Full control; approves teacher submissions |
| Teacher | **Read-only access to ALL students and ALL their details** (any batch/group/status, incl. attendance, marks, fee status, documents, history) | Enters attendance + marks (submit -> admin approves) |
| Student | Own data only | Own portal only |

Rules enforced in code: every data function calls `requireRole([...])` first; teachers get read queries only (no update/delete functions exist for them).

## Home page
Quick links show Admission, Apply Online, Class Routine, Notice Board, Student Login. Exam Schedule and Career are NOT on the home page; the Career section is hidden from header/footer menus (pages still exist).
