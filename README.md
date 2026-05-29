# Narayan Heart & Maternity Centre Backend API

Backend service powering the patient portal and administrative dashboard for Narayan Heart & Maternity Centre.

This API manages appointment booking, OTP verification, patient feedback, healthcare content delivery, and secure administrative operations. It serves as the central communication layer between the patient-facing website, admin dashboard, and MongoDB database.

---

## Features

* OTP-based appointment verification using Resend API
* Appointment management and scheduling workflows
* Session-based admin authentication
* Patient feedback and testimonial management
* Contact enquiry management
* YouTube Shorts integration for patient education
* Server-side caching for improved API performance
* Runtime request validation using Zod
* MongoDB-powered data persistence
* Secure admin route protection

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose ODM

### Authentication & Security

* Express Session
* Connect Mongo
* Bcrypt
* HTTP-only Session Cookies

### Validation

* Zod

### Third-Party Integrations

* Resend API
* YouTube Data API v3

---

## System Architecture

```text
Patient Portal
       |
       v
Backend API
       ^
       |
Admin Dashboard
       |
       v
MongoDB Atlas
```

The backend acts as the central service layer responsible for business logic, validation, database operations, authentication, and third-party API integrations.

---

## Core Modules

### Appointment Management

Handles appointment creation, retrieval, updates, and status management.

### OTP Verification

Generates and verifies one-time passwords before allowing appointment submissions.

### Admin Authentication

Implements secure session-based authentication using Express Session and MongoDB session storage.

### Feedback Management

Processes patient reviews and testimonials before displaying them on the website.

### Contact Management

Handles patient enquiries and communication requests.

### Healthcare Shorts Service

Fetches educational video content from YouTube and serves optimized responses through server-side caching.

---

## Security Features

* Session-based authentication
* Password hashing with bcrypt
* Protected admin routes
* Input validation using Zod
* Secure environment variable configuration
* HTTP-only session cookies
* MongoDB session persistence via Connect Mongo

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=
MONGODB_URI=
SESSION_SECRET=
RESEND_API_KEY=
YOUTUBE_API_KEY=
CLIENT_URL=
ADMIN_URL=
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/EmulationNerds685/Narayan_Clinic_Backend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Start production server:

```bash
npm start
```

---

## Related Repositories

### Patient Portal

Frontend application for patient appointment booking and healthcare content.

### Admin Dashboard

Administrative interface for managing appointments, feedback, and patient interactions.

---

## Future Improvements

* Redis-based distributed caching
* Queue-based email processing
* Real-time appointment synchronization
* Role-based access control (RBAC)
* WebSocket-powered admin notifications

---

## Author

**Bhaskar Tiwari**

Full Stack Developer

GitHub: https://github.com/EmulationNerds685
