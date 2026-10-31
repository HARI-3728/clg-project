# MediCare+ Healthcare Management System

MediCare+ is a unified digital healthcare platform designed with a clean **Green & White** aesthetic. It provides end-to-end healthcare operations across three distinct role-based workflows: **Patients**, **Doctors**, and **Hospitals**. All financial transactions and charges are calculated on the backend and denominated in **Indian Rupees (₹)**.

---

## Table of Contents
- [1. System Architecture](#1-system-architecture)
- [2. Setup and Launch Instructions](#2-setup-and-launch-instructions)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Backend Setup & Execution](#backend-setup--execution)
  - [Frontend Setup & Execution](#frontend-setup--execution)
- [3. Role-Based Workflow Guide](#3-role-based-workflow-guide)
  - [Patient Workflow](#patient-workflow)
  - [Doctor Workflow](#doctor-workflow)
  - [Hospital Workflow](#hospital-workflow)
- [4. Complete API Documentation](#4-complete-api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Doctor & Availability Endpoints](#doctor--availability-endpoints)
  - [Appointment Endpoints (Online & Offline)](#appointment-endpoints-online--offline)
  - [Prescriptions & Medical History Endpoints](#prescriptions--medical-history-endpoints)
  - [Automatic Medicine Reminders Endpoints](#automatic-medicine-reminders-endpoints)
  - [Medical Reports Endpoints](#medical-reports-endpoints)
  - [Hospital Bills Endpoints (Hospital Only)](#hospital-bills-endpoints-hospital-only)
  - [Pharmacy Bills Endpoints (Hospital Only)](#pharmacy-bills-endpoints-hospital-only)
  - [Public Catalogue & Healthcare Endpoints](#public-catalogue--healthcare-endpoints)
- [5. Security, Validation & Access Control](#5-security-validation--access-control)
- [6. Automated Verification Test Suites](#6-automated-verification-test-suites)

---

## 1. System Architecture

MediCare+ is structured into two cleanly separated tiers: a modern React Single Page Application (SPA) frontend and a Node.js Express REST API backend backed by MongoDB.

```
medicare_ee_project/
├── backend/
│   ├── config/             # Database connection & error logging
│   ├── controllers/        # Business logic controllers
│   ├── data/               # Seed data, static catalogs, runtime store
│   ├── middleware/         # JWT auth, role validation, patient/hospital isolation, file upload
│   ├── models/             # Mongoose schemas & data relationships (11 collections)
│   ├── routes/             # Express route modules
│   ├── tests/              # 4 automated test suites (194 test assertions)
│   ├── utils/              # ID generators, INR currency helpers, token signing
│   ├── server.js           # Server entry point & route registration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI widgets & role-aware layouts (Sidebar, TopNavbar)
│   │   ├── context/        # AuthContext (JWT & roles) & PatientContext (State & sync)
│   │   ├── data/           # Offline fallbacks & mock data
│   │   ├── pages/          # 18 role-based dashboards and feature pages
│   │   ├── App.jsx         # Client-side router & role guards
│   │   └── main.jsx
│   └── package.json
└── README.md
```

### Key Technical Stack:
- **Frontend**: React 18, Vite, React Router 6, Lucide React icons, CSS variables with Green + White design tokens (`#047857`, `#059669`, `#10b981`).
- **Backend**: Node.js, Express.js, MongoDB via Mongoose, JWT (JSON Web Tokens), Bcrypt.js, Multer (secure uploads).
- **Branding**: Official MediCare+ emerald green and white palette, preserved throughout all dashboards and layouts.
- **Currency**: Indian Rupees (`₹`, `INR`) across all billing, pricing, and receipts.

---

## 2. Setup and Launch Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI (optional; backend includes structured fallback handling and reports clear connection status on `/api/health`).

### Environment Configuration
The backend reads configuration from `backend/.env`. A configured `.env` file is located at `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/medicare_db
JWT_SECRET=medicare_super_secure_jwt_token_secret_key_2026
JWT_EXPIRE=30d
```

### Backend Setup & Execution
1. Open terminal and navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   # or with live reloading:
   npm run dev
   ```
4. Check backend status:
   - Base URL: `http://localhost:5000`
   - Health check: `http://localhost:5000/api/health`

### Frontend Setup & Execution
1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5173`.
5. Production build test:
   ```bash
   npm run build
   ```

---

## 3. Role-Based Workflow Guide

### Patient Workflow
1. **Registration & Login**:
   - Register with Name, Mobile, and optional details (`POST /api/auth/patient/register`).
   - Instant OTP login via Mobile Number (`POST /api/auth/patient/send-otp` -> `POST /api/auth/patient/verify-otp`).
   - Receives unique Medical ID (format `MC-XXXX-XXX`).
2. **Consultations & Appointments**:
   - **Online Booking**: Select Doctor -> Date -> Available Slot -> Confirm Video Teleconsultation with generated video room code (`APT-ONL-XXXX`).
   - **Offline Booking**: Select Hospital (e.g. KMCH) -> Doctor -> Date -> Available Slot -> Confirm OPD Visit with OPD token number (`APT-OFF-XXXX`).
   - Concurrency protection: Double-booking the same doctor at the same time is automatically rejected with `409 Conflict`.
3. **Prescriptions & Reminders**:
   - View prescriptions divided into **ACTIVE** and **INACTIVE** tabs.
   - When active prescriptions are created, daily dose reminders are automatically generated.
   - Patients can mark reminders as **Taken** or **Missed**; status updates in real time with timestamp tracking.
   - Inactive or expired prescriptions automatically stop future reminders.
4. **Medical Records & Diet**:
   - View complete Medical History across different hospitals (e.g. KMCH Hospital, ABC Hospital, MetroCare).
   - Securely upload lab reports & scans (PDF, JPG, PNG up to 10MB).
   - Access evidence-based diet plans tailored to clinical condition (e.g. Fever hydration, Diabetic low-glycemic, Hypertension low-sodium).
5. **Strict Boundary**: Patients **do not** have access to any hospital or pharmacy bills.

### Doctor Workflow
1. **Authentication**:
   - Secure login via Doctor Email and password (`dr.kumar@medicare.com` / `doctor123`).
   - Associated with hospital institution (e.g. KMCH Hospital, `hosp_1`).
2. **Availability Management**:
   - Configure separate Online and Offline days, hours, and slot banks.
   - Dynamic schedule synchronization prevents booking outside working hours.
3. **Clinical Desk & OPD Queue**:
   - View assigned patient appointments (Online video queue and Offline OPD tokens).
   - Accept, decline, or update consultation notes.
4. **Prescription Issuance**:
   - Issue structured digital prescriptions with medicine name, dosage, frequency, duration, and instructions.
   - Automatically attaches record to patient's multi-hospital Medical History.
   - Automatically triggers creation of pill reminders on the patient's schedule.
5. **Patient Record Access**:
   - Authorized access to assigned patient's longitudinal medical history and diagnostic reports across institutions.

### Hospital Workflow
1. **Authentication**:
   - Secure login via Hospital Email and password (`hosp@kmch.com` / `hospital123`).
   - Scoped to unique institution ID (`hosp_1`).
2. **Clinical Operations**:
   - Add and manage hospital doctors and specialties.
   - Monitor OPD attendance and emergency admissions.
3. **Hospital Bills System (OPD, Inpatient, Diagnostics)**:
   - Exclusively managed inside Hospital Dashboard.
   - Itemized charges: Consultation, Treatment, Laboratory Tests, Room Charges, and Other Charges.
   - Totals calculated on the backend in Indian Rupees (₹).
   - Generates unique invoice numbers (`INV-HOSP-YYYY-XXXX`).
   - Generates printable formal hospital tax invoice with hospital header, GSTIN, amount in words, and authorized signatory.
4. **Pharmacy Bills System (Dispensing Counter)**:
   - Dedicated counter sales management separated from clinical hospital bills.
   - Line items with medicine name, quantity, unit price, item totals, discount, and tax.
   - Totals calculated on backend in Indian Rupees (₹).
   - Generates unique pharmacy invoice numbers (`INV-PHARM-YYYY-XXXX`).
   - Generates printable official pharmacy receipt with Drug License details and pharmacist signatory.
5. **Strict Boundary**: Each hospital can only access its own billing and patient admission records.

---

## 4. Complete API Documentation

### Authentication Endpoints

#### `POST /api/auth/patient/register`
- **Access**: Public
- **Description**: Registers a new patient with unique Medical ID.
- **Request Body**:
  ```json
  {
    "name": "Ananya Sharma",
    "mobile": "9876543219",
    "email": "ananya@medicare.test",
    "bloodGroup": "B+",
    "age": 26
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Patient profile registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "usr_9421",
      "medicalID": "MC-4167-222",
      "name": "Ananya Sharma",
      "mobile": "9876543219",
      "role": "patient"
    }
  }
  ```

#### `POST /api/auth/patient/send-otp`
- **Access**: Public
- **Request Body**: `{ "mobile": "9876543210" }`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Verification OTP sent to +91 98765 43210",
    "mockOtp": "123456",
    "expiresIn": "10 minutes"
  }
  ```

#### `POST /api/auth/patient/verify-otp`
- **Access**: Public
- **Request Body**: `{ "mobile": "9876543210", "otp": "123456", "customName": "Thamizh" }`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Patient authenticated successfully with OTP.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": { "role": "patient", "medicalID": "MC-8942-021", "name": "Thamizh" }
  }
  ```

#### `POST /api/auth/doctor/login`
- **Access**: Public
- **Request Body**: `{ "email": "dr.kumar@medicare.com", "password": "doctor123" }`
- **Response (200 OK)**: Returns JWT bearer token and Doctor user profile with `role: "doctor"`.

#### `POST /api/auth/hospital/login`
- **Access**: Public
- **Request Body**: `{ "email": "hosp@kmch.com", "password": "hospital123" }`
- **Response (200 OK)**: Returns JWT bearer token and Hospital profile with `role: "hospital"`.

#### `GET /api/auth/me`
- **Access**: Private (Bearer Token)
- **Response (200 OK)**: Returns current authenticated user profile.

---

### Doctor & Availability Endpoints

#### `GET /api/doctor/availability`
- **Access**: Public / Authenticated
- **Query Params**: `doctorId=doc_1`
- **Response (200 OK)**: Returns online and offline schedules, consultation fees, and available days.

#### `PUT /api/doctor/availability`
- **Access**: Private (Doctor only)
- **Request Body**:
  ```json
  {
    "online": {
      "days": ["Monday", "Wednesday", "Friday"],
      "timing": "05:00 PM - 08:00 PM",
      "slots": ["05:00 PM", "06:00 PM", "07:00 PM"]
    },
    "offline": {
      "days": ["Monday", "Tuesday", "Thursday", "Saturday"],
      "timing": "10:00 AM - 01:00 PM",
      "slots": ["10:00 AM", "11:00 AM", "12:00 PM"]
    }
  }
  ```

---

### Appointment Endpoints (Online & Offline)

#### `GET /api/appointments/available-slots`
- **Access**: Public / Authenticated
- **Query Params**: `doctorId=doc_1&date=2026-11-20&type=ONLINE`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "doctorId": "doc_1",
    "appointmentDate": "2026-11-20",
    "appointmentType": "ONLINE",
    "totalSlots": 3,
    "bookedSlots": [],
    "availableSlots": ["05:00 PM", "06:00 PM", "07:00 PM"],
    "isFullyBooked": false
  }
  ```

#### `POST /api/appointments/online`
- **Access**: Private (Patient)
- **Workflow**: Patient -> Doctor -> Available Date -> Available Time -> Confirm
- **Request Body**:
  ```json
  {
    "doctorId": "doc_1",
    "appointmentDate": "2026-11-20",
    "appointmentTime": "05:00 PM",
    "notes": "Headache consultation"
  }
  ```
- **Response (201 Created)**: Returns confirmed appointment with generated `APT-ONL-XXXX` ID and video room code.
- **Concurrency**: Conflicting requests for the same slot return `409 Conflict`.

#### `POST /api/appointments/offline`
- **Access**: Private (Patient)
- **Workflow**: Patient -> Hospital -> Doctor -> Available Date -> Available Time -> Confirm
- **Request Body**:
  ```json
  {
    "hospitalId": "hosp_1",
    "doctorId": "doc_1",
    "appointmentDate": "2026-11-21",
    "appointmentTime": "10:00 AM",
    "notes": "General OPD consultation"
  }
  ```
- **Response (201 Created)**: Returns confirmed appointment with generated `APT-OFF-XXXX` ID and clinic queue token.

---

### Prescriptions & Medical History Endpoints

#### `POST /api/doctor/prescriptions`
- **Access**: Private (Doctor / Hospital)
- **Request Body**:
  ```json
  {
    "patientId": "usr_101",
    "diagnosis": "Acute Pharyngitis & Seasonal Allergy",
    "medicineName": "Levocetirizine 5mg",
    "dosage": "1 Tablet",
    "frequency": "Once Daily (Night)",
    "duration": "5 Days",
    "instructions": "Take after dinner with warm water"
  }
  ```
- **Response (201 Created)**: Creates prescription, links to patient, automatically appends to patient's Medical History, and generates dosage reminders.

#### `GET /api/patient/prescriptions`
- **Access**: Private (Patient / Doctor)
- **Query Params**: `status=ACTIVE` or `status=INACTIVE`, optional `hospitalId=...`
- **Response (200 OK)**: Returns prescriptions list filtered by status and hospital.

#### `PUT /api/prescriptions/:id/status`
- **Access**: Private (Doctor / Hospital / Patient)
- **Request Body**: `{ "status": "INACTIVE" }`
- **Response (200 OK)**: Toggles status between ACTIVE and INACTIVE; when inactive, automatically halts future pill reminders.

#### `GET /api/patient/medical-history`
- **Access**: Private (Patient / Doctor)
- **Response (200 OK)**: Returns chronological treatments and clinical visits across all hospitals.

---

### Automatic Medicine Reminders Endpoints

#### `GET /api/patient/reminders`
- **Access**: Private (Patient)
- **Response (200 OK)**: Returns scheduled reminders generated from active prescriptions.

#### `PUT /api/patient/reminders/:id/status`
- **Access**: Private (Patient)
- **Request Body**: `{ "action": "TAKEN" }` or `{ "action": "MISSED" }`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Medicine reminder updated to TAKEN.",
    "reminder": {
      "id": "rem_1",
      "taken": true,
      "takenToday": true,
      "lastTakenAt": "Today at 08:30 PM",
      "statusText": "Taken at 08:30 PM"
    }
  }
  ```

---

### Medical Reports Endpoints

#### `POST /api/patient/reports`
- **Access**: Private (Patient / Hospital / Doctor)
- **Request Body**:
  ```json
  {
    "name": "Complete Blood Count (CBC) Panel",
    "reportType": "Lab Report",
    "hospital": "KMCH (Kovai Medical Center)",
    "doctor": "Dr. Kumar",
    "fileName": "CBC_Report_KMCH.pdf",
    "fileSize": "1.8 MB",
    "fileType": "application/pdf",
    "summary": "WBC: 7,200/mcL (Normal). Platelets: 240,000/mcL. Hemoglobin: 14.5 g/dL."
  }
  ```
- **Response (201 Created)**: Validates document, sets `isPrivate: true`, and catalogs report.

#### `POST /api/patient/reports/upload`
- **Access**: Private (Multipart Form Data)
- **Form Field**: `reportFile` (PDF, JPG, PNG up to 10MB)

---

### Hospital Bills Endpoints (Hospital Only)

> [!IMPORTANT]
> Hospital billing endpoints are accessible strictly to authorized hospital staff (`role="hospital"`). Patients are blocked with `403 Forbidden`.

#### `POST /api/hospital/bills`
- **Access**: Private (Hospital only)
- **Request Body**:
  ```json
  {
    "patientId": "usr_101",
    "patientName": "Patient",
    "patientPhone": "+91 98765 43210",
    "doctorId": "doc_1",
    "doctorName": "Dr. Kumar",
    "consultationCharges": 800,
    "treatmentCharges": 1500,
    "laboratoryCharges": 700,
    "roomCharges": 0,
    "otherCharges": 0,
    "paymentStatus": "PAID",
    "notes": "OPD consultation and routine laboratory work"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Hospital bill generated successfully.",
    "bill": {
      "id": "hosp_bill_1730000000",
      "invoiceNumber": "INV-HOSP-2026-4412",
      "currency": "INR",
      "totalAmount": 3000,
      "paymentStatus": "PAID",
      "hospitalId": "hosp_1"
    }
  }
  ```

#### `GET /api/hospital/bills`
- **Access**: Private (Hospital only)
- **Response (200 OK)**: Returns hospital bills for the authenticated hospital.

#### `GET /api/hospital/bills/:id/printable`
- **Access**: Private (Hospital only)
- **Response (200 OK)**: Returns full invoice data including amount in words (e.g. *"Three Thousand Rupees Only"*) and authorized signatory for printing.

---

### Pharmacy Bills Endpoints (Hospital Only)

> [!IMPORTANT]
> Pharmacy billing is completely decoupled from clinical hospital bills, maintaining separate collections, counters, and APIs.

#### `POST /api/hospital/pharmacy-bills`
- **Access**: Private (Hospital only)
- **Request Body**:
  ```json
  {
    "patientId": "usr_101",
    "patientName": "Patient",
    "patientPhone": "+91 98765 43210",
    "items": [
      { "medicineId": "med_1", "medicineName": "Paracetamol 650mg", "quantity": 2, "unitPrice": 40 },
      { "medicineId": "med_2", "medicineName": "Amoxicillin 500mg", "quantity": 1, "unitPrice": 120 }
    ],
    "discount": 10,
    "tax": 15,
    "paymentStatus": "PAID"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Pharmacy bill generated successfully.",
    "bill": {
      "id": "pharm_bill_1730000000",
      "invoiceNumber": "INV-PHARM-2026-8021",
      "currency": "INR",
      "subtotal": 200,
      "discount": 10,
      "tax": 15,
      "totalAmount": 205,
      "paymentStatus": "PAID"
    }
  }
  ```

#### `GET /api/hospital/pharmacy-bills`
- **Access**: Private (Hospital only)
- **Response (200 OK)**: Returns dispensed pharmacy sales records.

#### `GET /api/hospital/pharmacy-bills/:id/printable`
- **Access**: Private (Hospital only)
- **Response (200 OK)**: Returns printable pharmacy counter receipt with Drug License registration.

---

### Public Catalogue & Healthcare Endpoints

- `GET /api/medicines` - Browse certified medicines catalogue with Indian Rupee prices and dosage info.
- `GET /api/medicines/:id` - Detailed medicine specifications, side effects, precautions, and pricing.
- `GET /api/hospitals` - Browse verified healthcare centers, emergency units, and departments.
- `GET /api/doctors` - Browse specialist directory with consultation fees and schedule indicators.
- `GET /api/diet-plans/:condition` - Educational nutrition plans for clinical recovery.

---

## 5. Security, Validation & Access Control

1. **Request Validation**:
   - Strict validation middleware prevents empty submissions, invalid mobile formats, and negative pricing.
   - Phone numbers must be valid 10-digit Indian numbers (`^[6-9]\d{9}$`).
2. **Private Route Protection**:
   - Protected routes require `Authorization: Bearer <JWT_TOKEN>`.
   - Expired or tampered tokens return `401 Unauthorized`.
3. **Role-Based Isolation (RBAC)**:
   - `patientDataOnly` middleware prevents patients from passing another patient's ID in query parameters or request bodies (`403 Forbidden`).
   - `hospitalDataOnly` middleware isolates institutional data; Hospital A cannot view or alter Hospital B's billing records.
   - Patients are strictly forbidden from Hospital & Pharmacy billing APIs (`403 Forbidden`).
4. **Secure File Uploads**:
   - Multer middleware validates MIME types: PDF, JPG, JPEG, PNG, WEBP.
   - File size ceiling enforced at 10 MB.
   - Uploaded files are assigned random unique UUIDs to prevent directory traversal or file replacement attacks.
5. **Credential Protection**:
   - Sensitive fields (`password`, OTP secrets) are excluded from user API payloads.
   - Passwords hashed using Bcrypt with salt factor 10.

---

## 6. Automated Verification Test Suites

MediCare+ includes four comprehensive automated test suites covering 194 test assertions.

### Running Backend Tests
```bash
# Run all 4 test suites sequentially (194 assertions)
npm --prefix backend test

# Run individual test suites
npm --prefix backend run test:models       # 42 Mongoose schema tests
npm --prefix backend run test:auth         # 25 Authentication & role tests
npm --prefix backend run test:billing      # 50 Hospital & Pharmacy billing tests
npm --prefix backend run test:integration  # 77 End-to-end integration tests
```

### Test Suite Summary:

| Test Suite | File | Tests | Status | Scope |
| :--- | :--- | :---: | :---: | :--- |
| **Models & Schemas** | `backend/tests/models.test.js` | 42 | ✅ Passed | All 11 Mongoose collections, relationships, INR currency validation |
| **Authentication & RBAC** | `backend/tests/auth.test.js` | 25 | ✅ Passed | Patient OTP, Doctor password, Hospital login, token extraction |
| **Hospital & Pharmacy Billing** | `backend/tests/billing.test.js` | 50 | ✅ Passed | Backend math calculations, INR invoices, receipts, patient lockout |
| **E2E Integration** | `backend/tests/integration.test.js` | 77 | ✅ Passed | Online/offline booking, double-booking prevention, status toggles, isolation |
| **Total** | | **194** | **100% Passed** | **Full System Verification** |

### Running Frontend Production Build
```bash
npm --prefix frontend run build
```
Build verification outputs: `✓ built in ~3.0s` with **0 errors**.

---

## License & Attribution
Developed for the **MediCare+** Healthcare Initiative. Preserves the official Green + White branding, INR currency standards, and multi-hospital data integration protocols.

