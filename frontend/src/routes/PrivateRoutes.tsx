import React, { JSX, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import SubscriptionLockModal from '../components/SubscriptionLockModal';

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

export const SubscriptionProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  const role = localStorage.getItem('role');
  const isDemo = role === 'demo' || localStorage.getItem('isDemoMode') === 'true' || localStorage.getItem('isDemoView') === 'true';
  const [lockStatus, setLockStatus] = useState<any>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated || role === 'superadmin' || isDemo) {
      setChecking(false);
      return;
    }

    let isMounted = true;
    axiosInstance.get('/tenants/current/subscription-lock-status')
      .then((res) => {
        if (isMounted) {
          if (res.data?.isLocked) {
            setLockStatus(res.data);
          } else {
            setLockStatus(null);
          }
          setChecking(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const data = err.response?.data;
          if (data?.code === 'SUBSCRIPTION_PAYMENT_REQUIRED' || data?.isLocked) {
            setLockStatus(data);
          }
          setChecking(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, role]);

  if (!isAuthenticated && !isDemo) {
    return <Navigate to="/adminlogin" replace />;
  }

  if (role === 'superadmin' || isDemo) {
    return children;
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5B3DF5]"></div>
      </div>
    );
  }

  if (lockStatus?.isLocked) {
    // Strictly withhold protected children from rendering while subscription is locked
    return (
      <div className="min-h-screen bg-[#F7F7FB] flex items-center justify-center p-4">
        <SubscriptionLockModal
          isOpen={true}
          lockReason={lockStatus.lockReason}
          subscriptionStatus={lockStatus.subscriptionStatus}
          planTier={lockStatus.planTier}
          billingCycle={lockStatus.billingCycle}
          payableAmount={lockStatus.payableAmount}
          baseAmount={lockStatus.baseAmount}
          taxAmount={lockStatus.taxAmount}
          periodEnd={lockStatus.periodEnd}
          message={lockStatus.message}
          onPaymentSuccess={() => {
            setLockStatus(null);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return children;
};

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  const isDemo = localStorage.getItem('role') === 'demo' || localStorage.getItem('isDemoMode') === 'true' || localStorage.getItem('isDemoView') === 'true';
  const location = useLocation();

  if (isAuthenticated || isDemo) {
    return <SubscriptionProtectedRoute>{children}</SubscriptionProtectedRoute>;
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

export const SuperAdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  const role = localStorage.getItem('role');

  if (!isAuthenticated) {
    return <Navigate to="/adminlogin" replace />;
  }

  if (role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
