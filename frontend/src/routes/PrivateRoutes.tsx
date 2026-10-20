import React, { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const protectedPrefixes = [
  '/dashboard',
  '/master',
  '/configuration',
  '/email',
  '/paymentmode',
  '/vehicle',
  '/orders',
  '/booking',
  '/vendors',
  '/drivers',
  '/invoice',
  '/reports',
  '/cache',
  '/uploads',
  '/paymentsuccess',
  '/company/edit',
  '/users/adduser',
  '/users/list',
  '/users/userdetails',
];

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return children;
  }

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    location.pathname.toLowerCase().startsWith(prefix.toLowerCase())
  );

  return isProtectedRoute ? (
    <Navigate to="/adminlogin" replace />
  ) : (
    <Navigate to="/" replace />
  );
};

export default PrivateRoute;
