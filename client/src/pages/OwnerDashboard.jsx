import React, { useState, useEffect } from "react";
import { Building2, Home, Key, DoorClosed, DollarSign, Wrench, AlertCircle, Loader2, Calendar, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { useAuth } from "../store/auth";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const OwnerDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`http://localhost:7000/api/owner/dashboard-stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-4 rounded-[2rem] flex items-center gap-3 w-full max-w-2xl mx-auto mt-10 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
        <AlertCircle size={24} className="animate-pulse" />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  const PIE_COLORS = {
    Occupied: "#10b981",
    Vacant: "#f59e0b",
    Other: "#64748b"
  };

  const occupancyData = stats?.occupancyChart?.filter(entry => entry.value > 0) || [];

  const statCards = [
    {
      label: "Total Properties",
      value: stats?.totalProperties || 0,
      icon: Building2,
      color: "indigo"
    },
    {
      label: "Total Units",
      value: stats?.totalUnits || 0,
      icon: Home,
      color: "blue"
    },
    {
      label: "Occupied Units",
      value: stats?.occupiedUnits || 0,
      icon: DoorClosed,
      color: "emerald"
    },
    {
      label: "Vacant Units",
      value: stats?.vacantUnits || 0,
      icon: Key,
      color: "amber"
    },
    {
      label: "Monthly Income",
      value: `$${(stats?.monthlyRentalIncome || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "violet"
    },
    {
      label: "Pending Approvals",
      value: stats?.pendingMaintenanceApprovals || 0,
      icon: Wrench,
      color: "rose"
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-0 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Owner Dashboard
          </h1>
          <p className="text-[var(--text-card)] font-medium">
            Welcome back, <span className="text-white">{user?.name}</span>. Here's a quick overview of your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--color-main)]/20 text-[var(--text-card)] shadow-lg">
          <Calendar size={14} className="text-[var(--color-primary)]" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--color-main)]/30 relative overflow-hidden group shadow-lg hover:shadow-[var(--color-primary)]/5 transition-all duration-500 hover:-translate-y-1">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-${stat.color}-500/5 group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:shadow-${stat.color}-500/20 transition-all`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-[var(--text-card)] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Income Overview Chart */}
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--color-main)]/30 shadow-xl lg:col-span-2 group hover:border-[var(--color-primary)]/50 transition-colors duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <TrendingUp className="text-violet-500" />
                Income Overview
              </h2>
              <p className="text-sm text-[var(--text-card)] mt-1 font-medium">Rental income over the last 6 months</p>
            </div>
          </div>
          <div className="h-[300px] w-full mt-4">
            {stats?.incomeChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.incomeChart}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, "Income"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#8b5cf6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6', className: "drop-shadow-lg" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-card)] font-medium pb-8">
                No income data available for the past 6 months.
              </div>
            )}
          </div>
        </div>

        {/* Occupancy Rate Chart */}
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--color-main)]/30 shadow-xl group hover:border-[var(--color-primary)]/50 transition-colors duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <PieChartIcon className="text-blue-500" />
                Occupancy Rate
              </h2>
              <p className="text-sm text-[var(--text-card)] mt-1 font-medium">Distribution of unit statuses</p>
            </div>
          </div>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            {occupancyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || PIE_COLORS.Other} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry) => <span className="text-[var(--text-card)] font-bold ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--text-card)] font-medium pb-8 border-b-0">
                No units created yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
