import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import AppLayout from '../layouts/AppLayout';
import PrivateRoute from './PrivateRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import LeadsPage from '../pages/LeadsPage';
import CompaniesPage from '../pages/CompaniesPage';
import CompanyDetailsPage from '../pages/CompanyDetailsPage';
import TasksPage from '../pages/TasksPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected Routes inside Persistent App Shell */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.LEADS} element={<LeadsPage />} />
          <Route path={ROUTES.COMPANIES} element={<CompaniesPage />} />
          <Route path={ROUTES.COMPANY_DETAILS} element={<CompanyDetailsPage />} />
          <Route path={ROUTES.TASKS} element={<TasksPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
