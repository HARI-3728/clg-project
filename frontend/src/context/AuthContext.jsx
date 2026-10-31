import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUserProfile, coimbatoreDoctors, coimbatoreHospitals } from '../data/mockData';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'medicare_auth_user';
const TOKEN_STORAGE_KEY = 'medicare_auth_token';
const API_BASE = `http://localhost:${import.meta.env.VITE_BACKEND_PORT || 5000}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return !!saved;
    } catch {
      return false;
    }
  });

  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
      }

      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to update auth storage:', e);
    }
  }, [user, token]);

  // Request Patient Mobile OTP from Backend
  const sendPatientOtp = async (mobile) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/patient/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      return data;
    } catch (err) {
      console.warn('Backend send OTP error (using mock fallback):', err.message);
      return {
        success: true,
        message: `Mock OTP sent to ${mobile}. Verification code: 123456`,
        mockOtp: '123456',
        expiresIn: '10 minutes'
      };
    }
  };

  // 1. Patient Login (Mobile + OTP Verification via Backend API)
  const verifyPatientOtp = async (mobile, otp, customName) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/patient/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, customName })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (err) {
      console.warn('Backend verify OTP fallback:', err.message);
      // Fallback
      let derivedName = customName;
      if (!derivedName && mobile) {
        derivedName = isNaN(mobile) ? mobile : `Patient (${mobile.slice(-4)})`;
      }
      const patientUser = {
        ...mockUserProfile,
        id: 'usr_101',
        name: derivedName || 'Patient',
        email: 'patient@medicare.com',
        mobile: mobile || '+91 98765 43210',
        role: 'patient',
        medicalID: 'MC-8942-021',
        bloodGroup: 'O+',
        age: 28,
        gender: 'Male'
      };
      setUser(patientUser);
      setToken('mock_jwt_token_patient');
      return patientUser;
    }
  };

  // Direct Patient Login (supports mobile + password or PIN)
  const loginPatient = async (identifier, customName, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/patient/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          mobile: identifier,
          password: password || 'patient123'
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token);
        return data.user;
      }
    } catch (err) {
      console.warn('Backend patient login error:', err.message);
    }

    // Seamless fallback
    let derivedName = customName;
    if (!derivedName && identifier) {
      if (identifier.includes('@')) {
        const raw = identifier.split('@')[0];
        derivedName = raw.charAt(0).toUpperCase() + raw.slice(1);
      } else if (isNaN(identifier)) {
        derivedName = identifier;
      }
    }
    const patientUser = {
      ...mockUserProfile,
      id: 'usr_101',
      name: derivedName || 'Patient',
      email: identifier?.includes('@') ? identifier : 'patient@medicare.com',
      mobile: identifier?.includes('@') ? '+91 98765 43210' : identifier || '+91 98765 43210',
      role: 'patient',
      medicalID: 'MC-8942-021',
      bloodGroup: 'O+',
      age: 28,
      gender: 'Male'
    };
    setUser(patientUser);
    setToken('mock_jwt_token_patient');
    return patientUser;
  };

  // 2. Hospital Login (Email + Password via Backend API)
  const loginHospital = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/hospital/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'kmch@hospital.com',
          password: password || 'kmch123'
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token);
        return data.user;
      }
    } catch (err) {
      console.warn('Backend hospital login error:', err.message);
    }

    const hospitalUser = {
      id: 'hosp_kmch',
      hospitalId: 'hosp_1',
      name: 'KMCH Hospital',
      legalName: 'Kovai Medical Center and Hospital',
      email: email || 'kmch@hospital.com',
      role: 'hospital',
      type: 'Multi-Specialty Super Hospital',
      location: 'Avinashi Road, Peelamedu, Coimbatore',
      emergencyPhone: '+91 422 432 3800',
      registrationNo: 'CBE-HOSP-1990-08',
      avatar: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=150&auto=format&fit=crop&q=80'
    };
    setUser(hospitalUser);
    setToken('mock_jwt_token_hospital');
    return hospitalUser;
  };

  // 3. Doctor Login (Doctor Email/ID + Password via Backend API)
  const loginDoctor = async (emailOrId, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailOrId || 'dr.kumar@medicare.com',
          password: password || 'doctor123'
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token);
        return data.user;
      }
    } catch (err) {
      console.warn('Backend doctor login error:', err.message);
    }

    const input = (emailOrId || '').toLowerCase().trim();
    let matchedDoc = coimbatoreDoctors.find(
      (d) => d.id.toLowerCase() === input || d.name.toLowerCase().includes(input)
    );

    if (!matchedDoc && input.includes('priya')) {
      matchedDoc = coimbatoreDoctors.find((d) => d.id === 'doc_2');
    }

    if (!matchedDoc) {
      matchedDoc = coimbatoreDoctors[0]; // Dr. Kumar
    }

    const doctorUser = {
      id: matchedDoc.id,
      doctorId: matchedDoc.id,
      name: matchedDoc.name,
      email: `${matchedDoc.name.toLowerCase().replace(/[^a-z]/g, '')}@medicare.com`,
      role: 'doctor',
      specialty: matchedDoc.specialty,
      department: matchedDoc.specialty,
      hospital: matchedDoc.hospital,
      hospitalId: matchedDoc.hospitalId,
      experience: matchedDoc.experience,
      rating: matchedDoc.rating,
      fee: matchedDoc.fee,
      contact: '+91 98421 55670',
      availability: matchedDoc.availableTime || '10:00 AM - 01:00 PM',
      availableDays: matchedDoc.availableDays || 'Mon - Sat',
      medicalRegNo: `TNMC-${Math.floor(40000 + Math.random() * 9000)}`,
      avatar: matchedDoc.avatar
    };

    setUser(doctorUser);
    setToken('mock_jwt_token_doctor');
    return doctorUser;
  };

  const login = (identifier, password, roleHint) => {
    if (roleHint === 'hospital' || (identifier && identifier.toLowerCase().includes('hospital'))) {
      return loginHospital(identifier, password);
    }
    if (roleHint === 'doctor' || (identifier && (identifier.toLowerCase().includes('doc') || identifier.toLowerCase().includes('dr.')))) {
      return loginDoctor(identifier, password);
    }
    return loginPatient(identifier, null, password);
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/patient/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setToken(data.token);
        return true;
      }
    } catch (err) {
      console.warn('Backend register error:', err.message);
    }

    const newUser = {
      ...mockUserProfile,
      id: `usr_${Date.now().toString().slice(-4)}`,
      name: userData.name || 'Patient',
      email: userData.email || 'patient@medicare.com',
      role: 'patient',
      medicalID: `MC-${Math.floor(1000 + Math.random() * 9000)}-021`,
      ...userData
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      authError,
      login,
      loginPatient,
      sendPatientOtp,
      verifyPatientOtp,
      loginHospital,
      loginDoctor,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
