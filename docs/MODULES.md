# MODULES.md: feature map (from the flowchart)

Each module = its own folder in `src/features/` + routes + SQL migration. Part numbers refer to PROGRESS.md. All routes already exist as placeholders (see ROUTES.md).

## Public website (Parts 4, 5, 13)
- **About Us**: overview, principal's message, teachers (Science/Business/Humanities), other staff, mission & vision, history, management committee, departments
- **Academic**: departments & subjects, courses, class routine, calendar, exam schedule, parent guidelines, dress code, co-curricular, regulations
- **Information**: notice board, news & events, facilities, achievements, holidays, policies, library, health awareness, payment info, important documents
- **Admission**: circular, online application, requirements, fees, scholarships, transfer, results, FAQ
- **Gallery** (photo/video), **Career** (at a glance, circulars, online application, recruitment results), **Contact**, **Login/Portal**

## Student Portal (Part 11)
Dashboard (overview, events, notifications) | Profile | Digital ID card | Class routine | Exam schedule | Results (history, subject marks, GPA, marksheet download) | Attendance (history, %) | Fees (paid, due, history, receipts) | Notices | Performance (overall, subject, rank) | Library (available, issued) | Documents

## Teacher Portal (Parts 8, 9, 12)
Dashboard (today's classes, pending attendance/marks, activity, notifications) | Profile | Assigned classes | Routines | Student info (ALL students, every detail, read-only) | **Attendance flow**: class -> section -> date -> list -> mark (Present/Absent/Late/Excused) -> draft -> submit -> correction request/history | **Marks flow**: exam -> batch & group -> subject -> entry (obtained/max/practical/written) -> draft -> submit -> correction/history | Exam hall duties | Notices | Reports | Submission history

## Admin Panel (Parts 4-16)
1 Dashboard & analytics | 2 Website mgmt | 3 Student mgmt (batch-based: Batches, Add Student, All Students, Transfer & Group Change; see BUSINESS_RULES.md) | 4 Teacher & staff mgmt | 5 Academic mgmt | 6 Examination mgmt | 7 Attendance mgmt | 8 Admission mgmt | 9 Finance | 10 Content | 11 Library | 12 Communication | 13 Reports (PDF/Excel/CSV) | 14 Users & permissions (custom roles) | 15 System settings | 16 Security & backup | 17 **Submission Approval Center**

## Approval workflow (Part 10)
Teacher submits attendance/marks -> status `submitted` -> Admin reviews -> **Approve** (attendance confirmed+published / results approved+published to students) or **Return for correction** (back to teacher as `returned`). Teachers can file correction requests after submission; admin approves or rejects.
Suggested status enum: `draft | submitted | returned | approved | published`.

## Cross-system links
Admin attendance/exam changes -> student views; admin content/website changes -> public site; admin student/teacher mgmt -> portal accounts.

## Open questions for later parts
- Custom roles/permissions: simple 3 roles first (Part 3), granular permissions in Part 16.
- Online payments gateway (bKash/SSLCommerz/Stripe?) for Part 14.
- Page content format: Markdown vs rich-text HTML for Part 3.
