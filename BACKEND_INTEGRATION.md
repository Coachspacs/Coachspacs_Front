# 🚀 Backend Integration & API Reference Guide (CoachSpace API)

This guide documents the complete, verified, and active endpoints in accordance with the official **CoachSpace API (Postman Collection)**.

---

## 🌐 Base URL & Environments
- **Local Proxy Base URL**: `/api` (rewritten to backend in `next.config.ts`)
- **Backend Base URL**: `https://coachspace-back.onrender.com/api` (or environment variable `NEXT_PUBLIC_API_URL` / `BACKEND_API_URL`)

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
