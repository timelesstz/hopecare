import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminDashboard from '../pages/admin/Dashboard';
import Login from '../pages/admin/Login';
import ConfigsPage from '../pages/admin/Configs';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { RequireAuth } from '../components/auth/RequireAuth';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="configs" element={<ConfigsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
