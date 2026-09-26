# Assignment Hub — Backend Authentication Service

A student-focused platform authentication backend powered by **Express.js**, **Supabase Auth**, and **PostgreSQL with Row-Level Security (RLS)**.

---

## 📌 Features Implemented

* **Supabase Native Authentication**: Session & token management, password hashing, and user identity.
* **Two-Step Registration with Mobile OTP**:
  * Step 1: Collect & validate `full_name`, `email`, `mobile`, `password`. Sends 6-digit OTP via SMS.
  * Step 2: Verify 6-digit OTP, create Supabase Auth user (`auth.users`), and create user profile record (`public.profiles`).
* **Mobile OTP Security Rules**:
  * 6-digit cryptographically secure numeric OTP
  * 5 minutes validity
  * Max 5 incorrect attempts before invalidating OTP
  * 5-minute temporary lockout after repeated failed attempts
  * 60 seconds resend cooldown
  * Max 3 resends per registration session
  * Temporary passwords securely encrypted with AES-256-GCM until verified
* **Normal Login**:
  * Email + Password only (no OTP required during normal login)
  * Returns Supabase access token, refresh token, user details, and profile
* **Forgot / Reset Password**:
  * Native Supabase email password recovery flow
  * Safe response to prevent account enumeration
* **Profile Management & College Association**:
  * `profiles` table linked via Supabase Auth UUID
  * Default single-college association (`colleges` table)
  * Role foundation: `student` (default), `admin`
  * RLS policies strictly preventing students from self-escalating roles or changing colleges
* **Security & Hardening**:
  * Helmet security headers, CORS protection, rate limiters, Joi validation
  * Sensitive credentials never exposed to client

---

## 🗄️ Database Setup (Supabase)

Run the SQL scripts in your **Supabase Dashboard > SQL Editor**:

1. [supabase/schema.sql](file:///c:/Users/Adityajha/Desktop/ASSIGNMENTHUB/supabase/schema.sql) — Creates `colleges`, `profiles`, and `otp_verifications` tables, updated_at triggers, and seeds the default college.
2. [supabase/rls.sql](file:///c:/Users/Adityajha/Desktop/ASSIGNMENTHUB/supabase/rls.sql) — Enables Row Level Security (RLS) policies for `profiles`, `colleges`, and `otp_verifications`.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
PORT=5000
NODE_ENV=development
API_PREFIX=/api/v1
CORS_ORIGIN=*

# Supabase Credentials (From Supabase Dashboard -> Settings -> API)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Default College ID
DEFAULT_COLLEGE_ID=00000000-0000-0000-0000-000000000001

# OTP Settings
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_LOCKOUT_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_RESENDS=3

# SMS Provider ('console', 'fast2sms', 'twilio')
SMS_PROVIDER=console
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000/api/v1`.

---

## 📡 API Endpoints

### 1. Registration — Step 1 (Initiate & Send OTP)
* **`POST /api/v1/auth/register/initiate`**
* **Request Body**:
```json
{
  "full_name": "Aditya Jha",
  "email": "aditya@example.com",
  "mobile": "9876543210",
  "password": "Password123"
}
```
* **Response `(200 OK)`**:
```json
{
  "success": true,
  "data": {
    "message": "OTP has been sent to your mobile number.",
    "verificationId": "123e4567-e89b-12d3-a456-426614174000",
    "expiresAt": "2026-09-26T07:15:00.000Z",
    "resendCooldownSeconds": 60
  }
}
```

---

### 2. Registration — Step 2 (Verify OTP & Complete)
* **`POST /api/v1/auth/register/verify-otp`**
* **Request Body**:
```json
{
  "verification_id": "123e4567-e89b-12d3-a456-426614174000",
  "otp": "123456"
}
```
* **Response `(201 Created)`**:
```json
{
  "success": true,
  "data": {
    "message": "Registration and mobile verification completed successfully.",
    "user": {
      "id": "supabase-user-uuid",
      "email": "aditya@example.com",
      "fullName": "Aditya Jha",
      "mobile": "9876543210",
      "role": "student"
    },
    "profile": {
      "id": "supabase-user-uuid",
      "full_name": "Aditya Jha",
      "email": "aditya@example.com",
      "mobile": "9876543210",
      "role": "student",
      "college_id": "00000000-0000-0000-0000-000000000001"
    }
  }
}
```

---

### 3. Resend Registration OTP
* **`POST /api/v1/auth/register/resend-otp`**
* **Request Body**:
```json
{
  "verification_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### 4. User Login (Email + Password)
* **`POST /api/v1/auth/login`**
* **Request Body**:
```json
{
  "email": "aditya@example.com",
  "password": "Password123"
}
```
* **Response `(200 OK)`**:
```json
{
  "success": true,
  "data": {
    "message": "Login successful.",
    "session": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "v1.MR...",
      "expiresIn": 3600,
      "tokenType": "bearer"
    },
    "user": {
      "id": "supabase-user-uuid",
      "email": "aditya@example.com",
      "role": "student"
    },
    "profile": {
      "id": "supabase-user-uuid",
      "fullName": "Aditya Jha",
      "email": "aditya@example.com",
      "mobile": "9876543210",
      "role": "student",
      "college": {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Default College Campus",
        "code": "DEFAULT_CAMPUS"
      }
    }
  }
}
```

---

### 5. Forgot Password (Email Reset)
* **`POST /api/v1/auth/forgot-password`**
* **Request Body**:
```json
{
  "email": "aditya@example.com"
}
```

---

### 6. Reset Password (Authenticated Recovery Link)
* **`POST /api/v1/auth/reset-password`**
* **Headers**: `Authorization: Bearer <access_token>`
* **Request Body**:
```json
{
  "password": "NewPassword123"
}
```

---

### 7. User Profile (Protected)
* **`GET /api/v1/user/profile`**
* **Headers**: `Authorization: Bearer <access_token>`
* **Response `(200 OK)`**: Returns user profile with college details.

* **`PUT /api/v1/user/profile`**
* **Headers**: `Authorization: Bearer <access_token>`
* **Request Body**:
```json
{
  "full_name": "Aditya Kumar Jha"
}
```

---

### 8. User Logout (Protected)
* **`POST /api/v1/auth/logout`**
* **Headers**: `Authorization: Bearer <access_token>`

---

## 🔒 Password Validation Rules

* Minimum 6 characters
* At least 1 uppercase letter (`[A-Z]`)
* At least 1 lowercase letter (`[a-z]`)
* At least 1 number (`[0-9]`)
* Special characters are optional
