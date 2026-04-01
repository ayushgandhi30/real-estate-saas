import React, { useEffect, useState } from "react";
import {
    Building2,
    Users,
    Key,
    Wrench,
    TrendingUp,
    PieChart as PieChartIcon,
    ArrowUpRight,
    Calendar,
    Clock,
    CheckCircle2,
    Loader2,
    LayoutDashboard,
    Activity,
    ShieldCheck,
    Navigation,
    Bell,
    CreditCard
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from "../store/auth";
import { BASE_URL } from "../store/api";
import Button from "../components/ui/Button";

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
            const response = await fetch(`${BASE_URL}/api/manager/dashboard/stats`, {
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

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-main)] font-['Inter']">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] animate-pulse">Initializing Operating Center...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

            {/* Header / Command Center */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-[var(--color-secondary)] tracking-tight">Manager Dashboard</h1>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] bg-white px-6 py-3.5 rounded-2xl border border-gray-100 text-[var(--text-muted)] shadow-sm">
                        <Calendar size={14} className="text-indigo-500" />
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* Tactical KPI Matrix */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Units", value: stats?.totalUnits || 0, icon: Building2, color: "indigo", desc: "Total individual units" },
                    { label: "Active Tenants", value: stats?.activeTenants || 0, icon: Users, color: "emerald", desc: "Active tenant accounts" },
                    { label: "Vacant Units", value: stats?.vacantUnits || 0, icon: Key, color: "amber", desc: "Units available for lease" },
                    { label: "Pending Maintenance", value: stats?.pendingMaintenance || 0, icon: Wrench, color: "rose", desc: "Open maintenance issues" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm group transition-all duration-500 hover:shadow-md relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 shadow-sm border border-${stat.color}-100 transition-all duration-700 group-hover:bg-${stat.color}-600 group-hover:text-white`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1.5 opacity-50">{stat.label}</p>
                            <h3 className="text-3xl font-black text-[var(--color-secondary)] tracking-tight group-hover:text-indigo-600 transition-colors">{stat.value}</h3>
                        </div>
                        <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-${stat.color}-50 scale-0 group-hover:scale-150 transition-transform duration-1000 opacity-40`} />
                    </div>
                ))}
            </section>

            {/* Analytics Visuals */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Revenue Momentum Chart */}
                <div className="bg-white px-10 py-5 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-[var(--color-secondary)] flex items-center gap-3">
                                Revenue Report
                            </h2>
                        </div>
                    </div>

                    <div className="h-[320px] w-full mt-auto relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData.length > 0 ? revenueData : []} margin={{ top: 0, right: 0, left: -20, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    fontWeight="black"
                                    tickLine={false}
                                    axisLine={false}
                                    dy={20}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    fontWeight="black"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `₹${v / 1000}k`}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderRadius: '24px', border: 'none', padding: '15px 20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#6366f1', fontWeight: '900', fontSize: '14px' }}
                                    labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#revenueGlow)" activeDot={{ r: 8, strokeWidth: 0, fill: '#6366f1' }} animationDuration={2000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Occupancy Logic - Donut Chart */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="mb-5 space-y-1 relative z-10">
                        <h2 className="text-2xl font-black text-[var(--color-secondary)] flex items-center gap-3">
                            Asset Utilization
                        </h2>
                    </div>

                    <div className="h-[300px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={occupancyData.length > 0 ? occupancyData : [{ name: 'Neutral', value: 1 }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={500}
                                    animationDuration={1500}
                                >
                                    {occupancyData.map((e, i) => (
                                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} className="hover:opacity-80 transition-all cursor-pointer shadow-xl" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderRadius: '20px', border: 'none', padding: '10px 15px', color: '#fff' }}
                                    itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(v) => <span className="text-[10px] font-black uppercase text-[var(--text-muted)] ml-2">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Metric */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4 text-center">
                            <p className="text-3xl font-black text-[var(--color-secondary)] leading-none">{stats?.totalUnits > 0 ? Math.round((stats.activeTenants / stats.totalUnits) * 100) : 0}%</p>
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Utilized</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Operational Tables */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Deployment Payments */}
                <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="py-2 px-10 border-b border-gray-50 flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-[var(--color-secondary)] flex items-center gap-3">
                                Recent Payments
                            </h2>
                        </div>
                        <Button variant="secondary" size="md" iconOnly icon={<Navigation size={20} />} />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-['Inter']">
                            <thead>
                                <tr className="bg-gray-50/50 text-[var(--text-muted)] text-[9px] uppercase font-black tracking-[0.2em] border-b border-gray-50">
                                    <th className="px-10 py-5">Name</th>
                                    <th className="px-10 py-5">Unit No</th>
                                    <th className="px-10 py-5 text-right">Rent</th>
                                    <th className="px-10 py-5 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {recentPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">No ledger entries detected</td>
                                    </tr>
                                ) : (
                                    recentPayments.map((p) => (
                                        <tr key={p._id} className="hover:bg-emerald-50/30 transition-all group border-l-4 border-l-transparent hover:border-l-emerald-500">
                                            <td className="px-10 py-6 text-sm font-black text-[var(--color-secondary)] group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{p.tenantId?.name}</td>
                                            <td className="px-10 py-6">
                                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-xl border border-indigo-100 shadow-sm">{p.unitId?.unitNumber}</span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <p className="text-[15px] font-black text-emerald-600 tracking-tight">₹{p.totalAmount.toLocaleString()}</p>
                                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase opacity-30 mt-0.5 tracking-tighter shadow-indigo-100">Settled Full</p>
                                            </td>
                                            <td className="px-10 py-6 text-right text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                                {new Date(p.paidAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lease Chronology */}
                <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-10 py-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-[var(--color-secondary)] flex items-center gap-3">
                                Upcoming Expiries
                            </h2>
                        </div>
                        <div className="relative">
                            <Bell className="text-amber-500 animate-swing" size={24} />
                            {upcomingExpiries.length > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full border-2 border-white" />}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-['Inter']">
                            <thead>
                                <tr className="bg-gray-50/50 text-[var(--text-muted)] text-[9px] uppercase font-black tracking-[0.2em] border-b border-gray-50">
                                    <th className="px-10 py-5">Entity</th>
                                    <th className="px-10 py-5 text-right">Expiry Offset</th>
                                    <th className="px-10 py-5 text-right">Manifest</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/50">
                                {upcomingExpiries.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">Terminus data static</td>
                                    </tr>
                                ) : (
                                    upcomingExpiries.map((lease) => (
                                        <tr key={lease._id} className="hover:bg-amber-50/30 transition-all group border-l-4 border-l-transparent hover:border-l-amber-500">
                                            <td className="px-10 py-6 text-sm font-black text-[var(--color-secondary)] group-hover:text-amber-700 transition-colors uppercase tracking-tight">{lease.userId?.name}</td>

                                            <td className="px-10 py-6 text-right">
                                                <p className="text-[13px] font-black text-gray-900 tracking-tight">{new Date(lease.leaseEnd).toLocaleDateString()}</p>
                                                <p className="text-[8px] font-black text-rose-600 uppercase mt-0.5 tracking-tighter italic">Critical Renewal Window</p>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <Button size="xs" variant="danger" className="animate-pulse">AUTHORIZE</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Global Aesthetics */}
            <style>{`
               @keyframes swing {
                  0%, 100% { transform: rotate(0deg); }
                  20% { transform: rotate(15deg); }
                  40% { transform: rotate(-15deg); }
                  60% { transform: rotate(10deg); }
                  80% { transform: rotate(-10deg); }
               }
               .animate-swing {
                  animation: swing 2s infinite ease-in-out;
               }
               .animate-in {
                  animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1);
               }
               @keyframes fade-in {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
               }
               .recharts-tooltip-cursor {
                  stroke-opacity: 0.1;
               }
            `}</style>
        </div>
    );
}
