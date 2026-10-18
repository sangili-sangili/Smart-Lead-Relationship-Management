import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

/**
 * Route guard component protecting private views from unauthenticated access
 */
const PrivateRoute = () => {
  const token = localStorage.getItem('leadflow_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
