import React from 'react';
import { Navigate } from 'react-router-dom';

export const HospitalLogin = () => {
  // Redirect to the unified split-screen login with hospital role active
  return <Navigate to="/login?role=hospital" replace />;
};
