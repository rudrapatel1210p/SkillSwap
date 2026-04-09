import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Not logged in
    return <Navigate to="/login" />;
  }

  if (!currentUser.emailVerified) {
    // Logged in but not verified
    return <Navigate to="/verify-email" />;
  }

  return children;
};

export default ProtectedRoute;
