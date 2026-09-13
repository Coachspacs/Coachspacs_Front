# 🚀 Backend Integration & API Reference Guide (CoachSpace API)

This guide documents the complete, verified, and active endpoints in accordance with the official **CoachSpace API (Postman Collection)**.

---

## 🌐 Base URL & Environments
- **Local Proxy Base URL**: `/api` (rewritten to backend in `next.config.ts`)
- **Backend Base URL**: Configured via `.env` (`NEXT_PUBLIC_API_URL` or `BACKEND_API_URL`)

---

## 🔐 1. Authentication & Registration (US-01)

### `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`, `Accept-Language: ar | en`
- **Request Body**:
```json
{
  "full_name": "Ali Student",
  "email": "ali.student@example.com",
  "password": "S3curePass!23",
  "role": "student"
}
```
*(Role options: `"student"` | `"instructor"`)*
- **Response (201 Created)**: Created user with pending verification / approval.

### `GET /api/auth/verify-email?uid={uid}&token={token}`
- **Query Params**: `uid`, `token`
- **Response (200 OK)**: Activates student / verifies instructor email.

### `POST /api/auth/verify-email/resend`
- **Request Body**: `{ "email": "user@example.com" }`

---

## 🔑 2. Login & Instructor Approval (US-02)

### `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "sara.coach@example.com",
  "password": "S3curePass!23"
}
```
- **Response (200 OK)**:
```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>",
  "role": "instructor",
  "approval_status": "approved",
  "user": {
    "id": 1,
    "full_name": "Sara Coach",
    "email": "sara.coach@example.com",
    "phone_number": "0599123456",
    "preferred_language": "ar",
    "avatar": "https://res.cloudinary.com/...",
    "role": "instructor",
    "approval_status": "approved"
  }
}
```

### `GET /api/auth/instructor/dashboard`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: 200 (if approved) | 403 (if pending review).

---

## 🔄 3. Session & Password Management (US-03)

### `POST /api/auth/refresh`
- **Request Body**: `{ "refresh": "<refresh_token>" }`
- **Response (200 OK)**: `{ "access": "<new_access_token>" }`

### `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: `{ "refresh": "<refresh_token>" }`
- **Response**: 205 (Blacklists refresh token).

### `POST /api/auth/password/forgot`
- **Request Body**: `{ "email": "ali.student@example.com" }`

### `POST /api/auth/password/reset`
- **Request Body**:
```json
{
  "uid": "<uid>",
  "token": "<token>",
  "new_password": "BrandNewPass!234"
}
```

### `PUT /api/auth/password/change`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "current_password": "S3curePass!23",
  "new_password": "EvenNewerPass!234"
}
```

---

## 👤 4. Profile & Avatar (US-04)

### `GET /api/users/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response (200 OK)**:
```json
{
  "id": 1,
  "full_name": "Sara Coach",
  "email": "sara.coach@example.com",
  "pending_email": null,
  "phone_number": "0599123456",
  "preferred_language": "ar",
  "avatar": "https://res.cloudinary.com/...",
  "role": "instructor",
  "approval_status": "approved"
}
```

### `PUT /api/users/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "full_name": "Sara Coach Updated",
  "phone_number": "0599123456",
  "preferred_language": "ar"
}
```

### `POST /api/users/me/avatar`
- **Headers**: `Authorization: Bearer <access_token>`, `Content-Type: multipart/form-data`
- **Form Data**: `avatar` (file <= 5MB, JPG/PNG/WebP)
- **Response**: `{ "avatar": "<cloudinary_url>" }`

### `POST /api/users/me/email/change`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: `{ "new_email": "sara.new-address@example.com" }`

### `POST /api/users/me/email/confirm`
- **Public Request Body**: `{ "uid": "<uid>", "token": "<token>" }`

---

## 📚 5. Bilingual Catalog Categories (US-05)

### `GET /api/catalog/categories`
- **Headers**: `Accept-Language: ar | en`
- **Response**: `[ { "id": 1, "name": "Design", "icon": "pen-tool" } ]`

---

## 🎓 6. Course Catalog (Browse / Search / Filter) (US-06)

### `GET /api/catalog/courses`
- **Headers**: `Accept-Language: ar | en`
- **Query Parameters**:
  - `category`: Category ID (e.g. `1`)
  - `level`: `beginner | intermediate | advanced`
  - `language`: `ar | en`
  - `price_min`: `0`
  - `price_max`: `100`
  - `search`: Keyword string
  - `sort`: `newest | price | popular`
  - `page`: Page number (default: `1`)
  - `page_size`: Items per page (default: `12`)
- **Response (200 OK)**:
```json
{
  "count": 42,
  "next": "...",
  "previous": null,
  "results": [ ... ]
}
```

---

## 🔍 7. Course Details & Preview Lessons (US-07)

### `GET /api/catalog/courses/:id`
- **Headers**: `Accept-Language: ar | en`, Optional `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "id": 1,
  "title": "Full-Stack Web Development",
  "description": "...",
  "price": 49.00,
  "level": "beginner",
  "language": "en",
  "cover_image": "https://...",
  "instructor": { "id": 1, "name": "Sara Coach", "avatar": "..." },
  "sections": [
    {
      "id": 1,
      "title": "Introduction",
      "lessons": [
        {
          "id": 1,
          "title": "Welcome",
          "duration_minutes": 5,
          "is_preview": true,
          "video_url": "https://..."
        }
      ]
    }
  ],
  "total_lessons": 12,
  "total_duration_minutes": 180,
  "is_free": false,
  "is_enrolled": false
}
```

---

## 🛠️ 8. Instructor Course Builder (US-08)

All requests require `Authorization: Bearer <access_token>` of an approved instructor.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/instructor/courses` | Create new course draft |
| `GET` | `/api/instructor/courses` | List caller's courses (all statuses) |
| `GET` | `/api/instructor/courses/:id` | Get full course outline & lesson videos |
| `PATCH` | `/api/instructor/courses/:id` | Update course metadata |
| `POST` | `/api/instructor/courses/:id/cover-image` | Upload course cover image (<= 5MB) |
| `POST` | `/api/instructor/courses/:id/video-upload-signature` | Generate signed params for direct Cloudinary upload |
| `POST` | `/api/instructor/courses/:id/sections` | Add section to course |
| `POST` | `/api/instructor/sections/:id/lessons` | Add lesson with `video_url` or `video_public_id` |
| `PATCH` | `/api/instructor/lessons/:id` | Update lesson (e.g. `{ "is_preview": true }`) |
| `PUT` | `/api/instructor/courses/:id/reorder` | Reorder sections and/or lessons |
| `DELETE` | `/api/instructor/lessons/:id` | Delete lesson (204) |
| `DELETE` | `/api/instructor/sections/:id` | Delete section (204) |
| `DELETE` | `/api/instructor/courses/:id` | Delete (204) or archive if enrolled (200) |

---

## 🎯 9. Student Enrollments & Lesson Progress Tracking (Sprint 8 Delta US-13)

All requests require `Authorization: Bearer <access_token>` of an enrolled student.

### `GET /api/enrollments`
- **Description**: Returns all course enrollments for the authenticated student, including progress percentages, completed lesson IDs, and completion certificates.
- **Response (200 OK)**:
```json
[
  {
    "id": 14,
    "course": {
      "id": 5,
      "title": "Full-Stack Web Development",
      "cover_image": "https://...",
      "instructor": { "name": "Sara Coach" }
    },
    "progress_percent": 45,
    "completed_lessons": [101, 102],
    "is_completed": false,
    "certificate": null
  }
]
```

### `POST /api/enrollments/:enrollment_id/lessons/:lesson_id/complete`
- **Description**: Marks a lesson as complete, stamps completion timestamp, and recalculates the enrollment's progress percentage. Reaching 100% automatically issues a certificate record.
- **Payload**: None (Empty body).
- **Response (200 OK)**:
```json
{
  "lesson_id": 101,
  "is_completed": true,
  "progress_percent": 50,
  "course_completed": false,
  "certificate": null
}
```

### `DELETE /api/enrollments/:enrollment_id/lessons/:lesson_id/complete`
- **Description**: Marks a lesson as incomplete, clears completion timestamp, and recalculates the enrollment's progress percentage downward.
- **Payload**: None.
- **Response (200 OK)**:
```json
{
  "lesson_id": 101,
  "is_completed": false,
  "progress_percent": 25,
  "course_completed": false,
  "certificate": null
}
```

---

## 📜 10. Certificates & Instructor Analytics (Sprint 10 Delta: US-16, US-17, US-18)

### `GET /api/certificates`
- **Headers**: `Authorization: Bearer <access_token>`
- **Description**: Returns all earned certificates for the authenticated student.
- **Response (200 OK)**:
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 101,
      "certificate_code": "CS-10001",
      "course": {
        "id": 5,
        "title": "Full-Stack Web Development",
        "cover_image": "https://..."
      },
      "issued_at": "2026-09-10T14:30:00Z",
      "pdf_url": "https://res.cloudinary.com/.../certificate-101.pdf"
    }
  ]
}
```

### `GET /api/certificates/:id/download`
- **Headers**: `Authorization: Bearer <access_token>`
- **Description**: Downloads the certificate PDF. If generation is in queue or retrying, returns `202 Accepted`. Returns `302 Found` (redirecting to stored PDF) or `200 OK` when ready.
- **Response (202 Accepted)**:
```json
{
  "status": "pending",
  "detail": "Certificate PDF generation is in progress. Retrying..."
}
```
- **Response (200 OK / 302 Found)**: Direct file stream or redirect to Cloudinary/S3 PDF URL.

### `GET /api/certificates/verify/:code`
- **Public Endpoint** (No `Authorization` header required).
- **Description**: Verifies the authenticity of a credential code. Enforces rate-limiting (maximum 20 requests/hour per IP).
- **Response (200 OK)**:
```json
{
  "student_full_name": "Ali Student",
  "course_title": "Full-Stack Web Development",
  "issued_at": "2026-09-10T14:30:00Z",
  "certificate_code": "CS-10001"
}
```
- **Response (404 Not Found)**:
```json
{
  "detail": "Certificate not found. Please verify the certificate code and try again."
}
```
- **Response (429 Too Many Requests)**:
```json
{
  "detail": "Rate limit exceeded (maximum 20 verification requests per hour). Please try again later."
}
```

### `GET /api/instructor/dashboard`
- **Headers**: `Authorization: Bearer <access_token>` of approved instructor.
- **Description**: Returns instructor metrics with true distinct students and per-course enrollment distribution.
- **Response (200 OK)**:
```json
{
  "total_courses": 6,
  "total_students": 42,
  "courses": [
    {
      "id": 5,
      "title": "Full-Stack Web Development",
      "status": "published",
      "enrollment_count": 28
    },
    {
      "id": 8,
      "title": "React Architecture",
      "status": "draft",
      "enrollment_count": 0
    }
  ]
}
```

### `GET /api/instructor/courses/:id/students`
- **Headers**: `Authorization: Bearer <access_token>` of course instructor.
- **Query Params**: `page` (default 1), `page_size` (default 10).
- **Description**: Lists students enrolled in the instructor's course with progress percentages. Returns 403 Forbidden if the caller does not own the course.
- **Response (200 OK)**:
```json
{
  "count": 28,
  "next": "/api/instructor/courses/5/students?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "full_name": "Ali Student",
      "email": "ali.student@example.com",
      "avatar": "https://...",
      "enrolled_at": "2026-09-01T10:00:00Z",
      "progress_percent": 100,
      "is_completed": true,
      "completed_at": "2026-09-10T14:30:00Z",
      "certificate_id": 101
    }
  ]
}
```

---

## 💻 Frontend Connected Components Map

| Feature Area | Connected UI Component | Service Called | Live Parameters |
|---|---|---|---|
| **Registration** | `src/components/auth/RegisterCard.tsx` | `authService.register` | `full_name`, `email`, `password`, `role` |
| **Email Verification** | `src/app/[locale]/(auth)/verify-email/page.tsx` | `authService.verifyEmail`, `resendVerificationEmail` | `uid`, `token`, `email` |
| **Login** | `src/components/auth/LoginCard.tsx` | `authService.login` | `email`, `password` |
| **Forgot / Reset Password** | `ForgotPasswordCard.tsx`, `ResetPasswordCard.tsx` | `authService.forgotPassword`, `resetPassword` | `email`, `uid`, `token`, `new_password` |
| **Profile Settings** | `StudentSettingsView.tsx`, `InstructorSettingsView.tsx`, `StudentWorkspace.tsx`, `InstructorWorkspace.tsx` | `userService.updateMyProfile`, `uploadAvatar`, `deleteAvatar`, `authService.changePassword` | `full_name`, `phone_number`, `preferred_language`, `avatar`, `current_password`, `new_password` |
| **Email Change** | `ChangeEmailModal.tsx`, `confirm-email/page.tsx` | `userService.requestEmailChange`, `confirmEmailChange` | `new_email`, `uid`, `token` |
| **Home Categories** | `src/components/home/TopCategoriesSection.tsx` | `categoryService.getCategories` | `Accept-Language: ar \| en`, links with `?category={id}` |
| **Course Catalog** | `src/components/catalog/CourseCatalogView.tsx`, `FilterSidebar.tsx`, `SearchSortBar.tsx` | `courseService.getCourses` | `category`, `level`, `language`, `price_min`, `price_max`, `search`, `sort`, `page`, `page_size` |
| **Course Details** | `src/app/[locale]/(public)/courses/[slug]/page.tsx`, `CourseDetailsView.tsx` | `courseService.getCourseById` | `id`, `Accept-Language`, Bearer token for `is_enrolled` |
| **Course Builder** | `src/components/instructor/CreateCourseStudio.tsx` | `instructorCourseService.*` | Course CRUD, Cloudinary video signature, sections, lessons, preview toggle, reorder |
| **Instructor Courses** | `src/components/instructor/InstructorWorkspace.tsx`, `InstructorDashboardView.tsx`, `InstructorCoursesPreview.tsx` | `instructorCourseService.getMyCourses`, `deleteCourse`, `updateCourse` | Courses listing, status filter, review submission, delete/archive |
| **Instructor Analytics & Dashboard** | `src/components/instructor/tabs/InstructorOverviewTab.tsx`, `InstructorWorkspace.tsx` | `instructorService.getDashboard` | `total_courses`, `total_students` (distinct), courses enrollment breakdown |
| **Instructor Course Students** | `src/components/instructor/tabs/InstructorStudentsTab.tsx` | `instructorService.getCourseStudents` | `course_id`, `page`, `page_size`, 403 access control |
| **Student Certificates & Download** | `src/components/student/tabs/StudentCertificatesTab.tsx`, `[id]/page.tsx` | `certificateService.getMyCertificates`, `downloadCertificate` | `id`, asynchronous retry polling on 202 Accepted |
| **Public Credential Verification** | `src/components/certificate/CertificateVerifyView.tsx`, `certificates/verify/[code]/page.tsx` | `certificateService.verifyCertificate` | `code`, public endpoint without auth, 404 security handling, 429 rate limit |
| **Lesson Progress & Complete** | `src/app/[locale]/student/learn/[courseId]/page.tsx`, `CourseContentSidebar.tsx` | `enrollmentService.markLessonComplete`, `markLessonIncomplete`, `getMyEnrollments` | `enrollment_id`, `lesson_id` |
| **Enrolled Courses** | `src/components/student/StudentWorkspace.tsx`, `StudentHomeWidget.tsx` | `enrollmentService.getMyEnrollments` | `progress_percent`, `completed_lessons`, `is_completed` |


