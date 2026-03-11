import React, { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Building2,
    Users,
    Key,
    Wrench,
    TrendingUp,
    PieChart as PieChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { useAuth } from "../store/auth";

export default function ManagerDashboard() {
    const { token, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [occupancyData, setOccupancyData] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [upcomingExpiries, setUpcomingExpiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:7000/api/manager/dashboard/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
                setRevenueData(data.revenueData);
                setOccupancyData(data.occupancyData);
                setRecentPayments(data.recentPayments);
                setUpcomingExpiries(data.upcomingExpiries);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchDashboardData();
    }, [token]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-0 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        Manager Dashboard
                    </h1>
                    <p className="text-[var(--text-card)] font-medium">Welcome back, <span className="text-white">{user?.name}</span>. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--color-main)]/20 text-[var(--text-card)]">
                    <Calendar size={14} className="text-[var(--color-primary)]" />
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            {/* Top Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Units", value: stats?.totalUnits || 0, icon: Building2, color: "blue" },
                    { label: "Active Tenants", value: stats?.activeTenants || 0, icon: Users, color: "emerald" },
                    { label: "Vacant Units", value: stats?.vacantUnits || 0, icon: Key, color: "orange" },
                    { label: "Pending Maintenance", value: stats?.pendingMaintenance || 0, icon: Wrench, color: "rose" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--color-main)]/30 relative overflow-hidden group shadow-lg hover:shadow-[var(--color-primary)]/5 transition-all duration-500">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-${stat.color}-500/5 group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 border border-${stat.color}-500/20`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-black text-[var(--text-card)] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rent Collection Chart */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--color-main)]/30 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" />
                                Rent Collection
                            </h2>
                            <p className="text-sm text-[var(--text-card)] mt-1 font-medium">Monthly revenue trends</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData.length > 0 ? revenueData : [{ name: 'Jan', amount: 4000 }, { name: 'Feb', amount: 3000 }, { name: 'Mar', amount: 2000 }]}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Occupancy Chart */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--color-main)]/30 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <PieChartIcon className="text-blue-500" />
                                Occupancy Status
                            </h2>
                            <p className="text-sm text-[var(--text-card)] mt-1 font-medium">Current unit utilization</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={occupancyData.length > 0 ? occupancyData : [{ name: 'Empty', value: 1 }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {occupancyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Rent Payments Table */}
                <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--color-main)]/30 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-[var(--color-main)]/10">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500" />
                            Recent Rent Payments
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[var(--bg-main)]/30 text-[var(--text-card)] text-[10px] uppercase font-black tracking-widest">
                                    <th className="px-8 py-4">Tenant</th>
                                    <th className="px-8 py-4">Unit</th>
                                    <th className="px-8 py-4">Amount</th>
                                    <th className="px-8 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-main)]/5">
                                {recentPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center text-sm font-medium text-[var(--text-card)]">No recent payments found</td>
                                    </tr>
                                ) : recentPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-[var(--color-main)]/5 transition-colors">
                                        <td className="px-8 py-4 text-sm font-bold text-white">{payment.tenantId?.name}</td>
                                        <td className="px-8 py-4">
                                            <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-2 py-1 rounded-lg border border-blue-500/20">{payment.unitId?.unitNumber}</span>
                                        </td>
                                        <td className="px-8 py-4 text-sm font-black text-emerald-500">${payment.totalAmount}</td>
                                        <td className="px-8 py-4 text-xs font-medium text-[var(--text-card)]">{new Date(payment.paidAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Lease Expiry Table */}
                <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--color-main)]/30 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-[var(--color-main)]/10">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Clock className="text-amber-500" />
                            Upcoming Lease Expiries
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[var(--bg-main)]/30 text-[var(--text-card)] text-[10px] uppercase font-black tracking-widest">
                                    <th className="px-8 py-4">Tenant</th>
                                    <th className="px-8 py-4">Unit</th>
                                    <th className="px-8 py-4">Expiry Date</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-main)]/5">
                                {upcomingExpiries.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center text-sm font-medium text-[var(--text-card)]">No upcoming expiries</td>
                                    </tr>
                                ) : upcomingExpiries.map((lease) => (
                                    <tr key={lease._id} className="hover:bg-[var(--color-main)]/5 transition-colors">
                                        <td className="px-8 py-4 text-sm font-bold text-white">{lease.userId?.name}</td>
                                        <td className="px-8 py-4">
                                            <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black px-2 py-1 rounded-lg border border-orange-500/20">{lease.unitId?.unitNumber}</span>
                                        </td>
                                        <td className="px-8 py-4 text-sm font-black text-white">{new Date(lease.leaseEnd).toLocaleDateString()}</td>
                                        <td className="px-8 py-4">
                                            <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black px-2 py-1 rounded-lg border border-rose-500/20 uppercase tracking-wider">Expiring</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
