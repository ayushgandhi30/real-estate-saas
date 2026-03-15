import React from 'react';
import { useAuth } from '../store/auth';
import ManagerDashboard from './ManagerDashboard';
import OwnerDashboard from './OwnerDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "SUPER_ADMIN") {
    return <SuperAdminDashboard />;
  }

  if (role === "MANAGER") {
    return <ManagerDashboard />;
  }

  if (role === "OWNER") {
    return <OwnerDashboard />;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
            <h1 className="text-3xl font-black text-white">Welcome, {user?.name}</h1>
            <p className="text-[var(--text-card)]">Your account is active. Please use the sidebar to navigate.</p>
        </div>
    </div>
  );
};

export default Dashboard;
