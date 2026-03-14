import React from 'react';
import { Users, DollarSign, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/auth';
import ManagerDashboard from './ManagerDashboard';
import OwnerDashboard from './OwnerDashboard';

const stats = [
  { title: "Total Users", value: "1,234", icon: Users, color: "bg-blue-500", change: "+12% from last month" },
  { title: "Total Revenue", value: "$45,231", icon: DollarSign, color: "bg-green-500", change: "+8% from last month" },
  { title: "Properties Listed", value: "342", icon: Building, color: "bg-purple-500", change: "+24 new this month" },
  { title: "Pending Requests", value: "12", icon: AlertCircle, color: "bg-orange-500", change: "-2 from yesterday" },
];

const recentActivities = [
  { user: "Alice Johnson", action: "added a new property", time: "2 hours ago" },
  { user: "Bob Smith", action: "modified user roles", time: "4 hours ago" },
  { user: "Charlie Davis", action: "updated settings", time: "1 day ago" },
  { user: "Diana Prince", action: "viewed audit logs", time: "1 day ago" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "MANAGER") {
    return <ManagerDashboard />;
  }

  if (role === "OWNER") {
    return <OwnerDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Dashboard Overview
          </h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${stat.color} text-white shadow-md`}>
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
              <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
              <div className="mt-4 text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-full">
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
          <ul className="space-y-4">
            {recentActivities.map((activity, index) => (
              <li key={index} className="flex items-center gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{activity.user}</span> {activity.action}
                  </p>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions or Another Widget */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">
              Add New User
            </button>
            <button className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">
              Create Property
            </button>
            <button className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">
              Generate Report
            </button>
            <button className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">
              System Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
