# 🚀 Backend Integration Guide (Coach Space Next.js Frontend)

Welcome to the **Coach Space** Frontend codebase! This guide is designed for the backend developer taking over to connect real API endpoints cleanly and seamlessly.

---

## 📁 Project Architecture & Key Directories

```text
coach-space-next/
├── app/                  # Next.js App Router (pages & layouts)
│   ├── page.tsx          # Home / Registration Page
│   ├── login/page.tsx    # Login Page
│   └── globals.css       # Design System & Tailwind CSS Rules
├── components/           # Modular & Reusable UI Components
│   ├── auth/             # Authentication Cards (RegisterCard, LoginCard)
│   ├── layout/           # Global Header & Footer
│   └── ui/               # Reusable Form Inputs, Logo, Password Strength Bar
├── lib/
│   ├── api/
│   │   └── authService.ts # 👈 ALL API CALLS ARE DECOUPLED HERE
│   └── constants.ts      # Site Constants & Navigation Config
└── types/
    └── index.ts          # 👈 Full TypeScript Interfaces & Data Contracts
```

---

## 🔌 API Service Layer (`lib/api/authService.ts`)

All authentication API calls have been cleanly decoupled into [`lib/api/authService.ts`](file:///c:/Users/Mohamed/Downloads/coach-space-next/lib/api/authService.ts).

### 1. Environment Variable
Create a `.env.local` file in the root directory (refer to [`.env.example`](file:///c:/Users/Mohamed/Downloads/coach-space-next/.env.example)):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

### 2. Available Endpoints to Connect

#### A. User Registration (`POST /auth/register`)
- **Request Payload (`RegisterFormData`)**:
```json
{
  "role": "student" | "coach",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecretPassword123!",
  "agreeToTerms": true
}
```

- **Expected Success Response (`AuthResponse`)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "usr_123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "message": "User registered successfully"
}
```

- **Expected Failure Response (HTTP 400 / 422 / 500)**:
```json
{
  "success": false,
  "message": "Email is already registered"
}
```

---

#### B. User Login (`POST /auth/login`)
- **Request Payload (`LoginFormData`)**:
```json
{
  "email": "john@example.com",
  "password": "SecretPassword123!",
  "rememberMe": true
}
```

- **Expected Success Response (`AuthResponse`)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "usr_123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "message": "Login successful"
}
```

---

## 🛠️ Step-by-Step for Backend Developer

1. Open [`lib/api/authService.ts`](file:///c:/Users/Mohamed/Downloads/coach-space-next/lib/api/authService.ts).
2. Uncomment the `fetch` / `axios` calls inside `register()` and `login()`.
3. Add JWT token storage (e.g. `localStorage.setItem('token', response.token)` or HttpOnly cookies).
4. Run `npm run dev` to test end-to-end integration!

---

## 🔒 Frontend Features Handled For You

- ✅ **Client-side Form Validation**: Full name, email format, password length & strength.
- ✅ **Bilingual Support (RTL / LTR)**: Dynamic language toggling (Arabic / English) with Cairo font optimization.
- ✅ **No Scroll Viewport Fit**: Clean layout fitted to screen heights across devices.
- ✅ **Accessibility & UX**: ARIA roles, live password strength meter, loading spinners.
