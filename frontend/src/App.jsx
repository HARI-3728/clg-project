import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PatientDataProvider } from './context/PatientContext';
import { PageLayout } from './components/layout/PageLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { Login } from './pages/Login';
import { HospitalLogin } from './pages/HospitalLogin';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Medicines } from './pages/Medicines';
import { MedicineDetails } from './pages/MedicineDetails';
import { Prescriptions } from './pages/Prescriptions';
import { RoutineMedicines } from './pages/RoutineMedicines';
import { MedicalHistoryReports } from './pages/MedicalHistoryReports';
import { Notifications } from './pages/Notifications';
import { HealthRecords } from './pages/HealthRecords';
import { Reminders } from './pages/Reminders';
import { Vaccinations } from './pages/Vaccinations';
import { NearbyHealthcare } from './pages/NearbyHealthcare';
import { Emergency } from './pages/Emergency';
import { Appointments } from './pages/Appointments';
import { MedicalHistory } from './pages/MedicalHistory';
import { DietPlan } from './pages/DietPlan';
import { HospitalBills } from './pages/HospitalBills';
import { PharmacyBills } from './pages/PharmacyBills';
import { Profile } from './pages/Profile';
import { CheckupsScans } from './pages/CheckupsScans';

export default function App() {
  return (
    <AuthProvider>
      <PatientDataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/hospital-login" element={<HospitalLogin />} />
            <Route path="/register" element={<Register />} />

            {/* Main App Shell Layout */}
            <Route path="/" element={<PageLayout />}>
              {/* Public Routes (Accessible without login - Task 3) */}
              <Route index element={<Dashboard />} />
              <Route path="medicines" element={<Medicines />} />
              <Route path="medicines/:id" element={<MedicineDetails />} />
              <Route path="nearby" element={<NearbyHealthcare />} />

              {/* Protected Management Features (Login Required - Task 3) */}
              <Route path="prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
              <Route path="routine-medicines" element={<ProtectedRoute><RoutineMedicines /></ProtectedRoute>} />
              <Route path="medical-history-reports" element={<ProtectedRoute><MedicalHistoryReports /></ProtectedRoute>} />
              <Route path="health-records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
              <Route path="medical-history" element={<ProtectedRoute><MedicalHistory /></ProtectedRoute>} />
              <Route path="appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
              <Route path="vaccinations" element={<ProtectedRoute><Vaccinations /></ProtectedRoute>} />
              <Route path="emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
              <Route path="diet-plan" element={<ProtectedRoute><DietPlan /></ProtectedRoute>} />
              <Route path="checkups-scans" element={<ProtectedRoute><CheckupsScans /></ProtectedRoute>} />
              {/* Billing ONLY for Hospital Dashboard - No Patient Access */}
              <Route path="hospital-bills" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalBills /></ProtectedRoute>} />
              <Route path="pharmacy-bills" element={<ProtectedRoute allowedRoles={['hospital']}><PharmacyBills /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PatientDataProvider>
    </AuthProvider>
  );
}
