import React, { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Building2,
    Users,
    DollarSign,
    UserCheck,
    TrendingUp,
    PieChart as PieChartIcon,
    Calendar,
    CheckCircle2,
    Clock,
    Loader2,
    Briefcase,
    Home,
    Layers
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";

export default function SuperAdminDashboard() {
    const { token, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [growthData, setGrowthData] = useState([]);
    const [propertyDistribution, setPropertyDistribution] = useState([]);
    const [recentOwners, setRecentOwners] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:7000/api/admin/dashboard-stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data.summary);

                // Process growth data for chart
                const months = [...new Set([
                    ...data.growth.userGrowth.map(d => d._id),
                    ...data.growth.propertyGrowth.map(d => d._id)
                ])].sort();

                const combinedGrowth = months.map(month => {
                    const userData = data.growth.userGrowth.find(d => d._id === month);
                    const propertyData = data.growth.propertyGrowth.find(d => d._id === month);
                    return {
                        month,
                        users: userData ? userData.count : 0,
                        properties: propertyData ? propertyData.count : 0
                    };
                });
                setGrowthData(combinedGrowth);

                // Process property distribution for pie chart
                const dist = data.propertyDistribution.map(item => ({
                    name: item._id.charAt(0) + item._id.slice(1).toLowerCase(),
                    value: item.count
                }));
                setPropertyDistribution(dist);

                setRecentOwners(data.recentOwners);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    const handleApproveOwner = async (ownerId) => {
        try {
            const response = await fetch(`http://localhost:7000/api/admin/owner/${ownerId}/approve`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success("Owner approved successfully");
                fetchDashboardData();
            } else {
                toast.error("Failed to approve owner");
            }
        } catch (error) {
            toast.error("An error occurred while approving owner");
        }
    };

    useEffect(() => {
        if (token) fetchDashboardData();
    }, [token]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        Super Admin Dashboard
                    </h1>
                </div>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
                    { label: "Total Owners", value: stats?.totalOwners || 0, icon: UserCheck, color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
                    { label: "Properties", value: stats?.totalProperties || 0, icon: Building2, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
                    { label: "Total Tenants", value: stats?.totalTenants || 0, icon: Layers, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
                    { label: "Mo. Revenue", value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--color-main)]/20 shadow-xl relative overflow-hidden group hover:border-[var(--color-primary)]/30 transition-all duration-500">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" style={{ backgroundColor: stat.color }}></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="p-3 rounded-2xl border transition-colors duration-500" style={{ backgroundColor: stat.bg, color: stat.color, borderColor: `${stat.color}33` }}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-[var(--text-card)] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white tabular-nums tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--color-main)]/20 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <TrendingUp size={20} className="text-emerald-500" />
                                </div>
                                Platform Growth
                            </h2>
                            <p className="text-sm text-[var(--text-card)] mt-1 font-medium">Monthly acquisition metrics</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData.length > 0 ? growthData : [{ month: '2026-01', users: 0, properties: 0 }]}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorProperties" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        const [year, month] = str.split('-');
                                        const date = new Date(year, month - 1);
                                        return date.toLocaleDateString('default', { month: 'short' });
                                    }}
                                />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '13px' }}
                                    cursor={{ stroke: '#334155', strokeWidth: 1 }}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '30px' }} />
                                <Area type="monotone" dataKey="users" name="New Users" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="properties" name="New Properties" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorProperties)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--color-main)]/20 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <PieChartIcon size={20} className="text-purple-500" />
                                </div>
                                Property Types
                            </h2>
                            <p className="text-sm text-[var(--text-card)] mt-1 font-medium">Assets by category</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={propertyDistribution.length > 0 ? propertyDistribution : [{ name: 'None', value: 1 }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={10}
                                    dataKey="value"
                                    isAnimationActive={false}
                                >
                                    {propertyDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Pending Owners Table */}
            <div className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--color-main)]/20 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-[var(--color-main)]/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-white flex items-center gap-2">
                            <Clock size={20} className="text-amber-500" />
                            Recent Owners (Pending Approval)
                        </h2>
                        <p className="text-xs text-[var(--text-card)] mt-0.5 font-medium">New registrations requiring verification</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--bg-main)]/30 text-[var(--text-card)] text-[10px] uppercase font-black tracking-widest">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Signed Up</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-main)]/5">
                            {recentOwners.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm font-medium text-[var(--text-card)]">No pending approvals</td>
                                </tr>
                            ) : recentOwners.map((owner) => (
                                <tr key={owner._id} className="hover:bg-[var(--color-main)]/5 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-white">{owner.user?.name}</td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-card)]">{owner.user?.email}</td>
                                    <td className="px-6 py-4 text-xs font-medium text-[var(--text-card)]">
                                        {new Date(owner.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                                            {owner.ownerType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleApproveOwner(owner._id)}
                                            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg transition-all shadow-sm hover:shadow-emerald-500/20"
                                        >
                                            APPROVE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
