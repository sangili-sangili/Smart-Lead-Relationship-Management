import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component protecting private views from unauthenticated access
 */
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#6366F1]">
        <div className="w-10 h-10 border-3 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin mb-4" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
          Verifying session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
