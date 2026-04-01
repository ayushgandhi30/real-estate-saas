import React, { useState, useEffect } from "react";
import {
    IndianRupee,
    Users,
    Building2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Download,
    PieChart,
    BarChart3,
    Clock,
    User,
    Home,
    UtilityPole,
    Wrench,
    Activity,
    MoreVertical
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Cell,
    PieChart as RePieChart,
    Pie,
    AreaChart,
    Area
} from "recharts";
import { useAuth } from "../store/auth";
import { BASE_URL } from "../store/api";
import Button from "../components/ui/Button";

const SuperAdminRevenueReport = () => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/admin/revenue-stats`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error("Error fetching super admin revenue stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-[var(--color-primary)]/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-10 text-[var(--color-secondary)] font-black text-center">No intelligence data available at this time.</div>;

    const {
        summaryCards,
        revenueByOwner,
        revenueByProperty,
        monthlyRevenueTrend,
        occupancyStats,
        pendingRentReport
    } = data;

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);

    const statsConfig = [
        { title: "Total Rent", value: summaryCards.totalRent, icon: Home, color: "bg-blue-50 text-blue-600" },
        { title: "Total Maintenance", value: summaryCards.totalMaintenance, icon: Wrench, color: "bg-emerald-50 text-emerald-600" },
        { title: "Total Utility", value: summaryCards.totalUtility, icon: UtilityPole, color: "bg-amber-50 text-amber-600" },
        { title: "Total Revenue", value: summaryCards.totalRevenue, icon: IndianRupee, color: "bg-indigo-50 text-indigo-600" },
        { title: "Total Pending Rent", value: summaryCards.pendingRent, icon: Clock, color: "bg-rose-50 text-rose-600" },
    ];

    const pieData = [
        { name: 'Occupied', value: occupancyStats.occupiedUnits, color: '#10b981' },
        { name: 'Vacant', value: occupancyStats.vacantUnits, color: '#f43f5e' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-secondary)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[var(--color-secondary)] tracking-tight">
                        Revenue Report
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="secondary" size="md" icon={<Download size={18} />} className="cursor-pointer">
                        Download Report
                    </Button>
                </div>
            </header>

            {/* 1️⃣ Revenue Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {statsConfig.map((stat, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 p-6 sm:p-8 rounded-[2rem] hover:border-[var(--color-primary)]/30 transition-all group relative overflow-hidden shadow-sm hover:shadow-md">
                        <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={22} />
                        </div>
                        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-60 group-hover:opacity-100 transition-opacity">{stat.title}</p>
                        <h3 className="text-xl sm:text-2xl font-black text-[var(--color-secondary)] tracking-tighter">{formatCurrency(stat.value)}</h3>
                        <div className="absolute -bottom-1 -right-1 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <stat.icon size={80} />
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2️⃣ Revenue by Owner */}
                <div className="bg-white border border-gray-100 p-6 sm:p-10 rounded-[2.5rem] space-y-8 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-[var(--color-secondary)] uppercase tracking-widest flex items-center gap-4">
                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                            Revenue By Owner
                        </h3>
                    </div>
                    <div className="h-[250px] sm:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByOwner}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="ownerName" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(val) => formatCurrency(val)}
                                />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto pt-4 no-scrollbar">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="text-[10px] uppercase font-black text-[var(--text-muted)] border-b border-gray-50 opacity-60">
                                <tr>
                                    <th className="pb-4">Owner Identity</th>
                                    <th className="pb-4">Portfolio</th>
                                    <th className="pb-4">Cap.</th>
                                    <th className="pb-4 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {revenueByOwner.map((owner, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5 font-black text-[var(--color-secondary)] text-sm">{owner.ownerName}</td>
                                        <td className="py-5 text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest opacity-60">{owner.propertyCount} Prop.</td>
                                        <td className="py-5 text-[var(--text-muted)] text-[11px] font-bold opacity-60">{owner.totalUnits} Units</td>
                                        <td className="py-5 text-right font-black text-emerald-600 italic text-sm">{formatCurrency(owner.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3️⃣ Revenue by Property */}
                <div className="bg-white border border-gray-100 p-6 sm:p-10 rounded-[2.5rem] space-y-8 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-[var(--color-secondary)] uppercase tracking-widest flex items-center gap-4">
                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                            Property Revenue
                        </h3>
                    </div>
                    <div className="h-[250px] sm:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByProperty} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <YAxis dataKey="propertyName" type="category" stroke="#94a3b8" fontSize={10} width={80} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(val) => formatCurrency(val)}
                                />
                                <Bar dataKey="monthlyRevenue" fill="#10b981" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto pt-4 no-scrollbar">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="text-[10px] uppercase font-black text-[var(--text-muted)] border-b border-gray-50 opacity-60">
                                <tr>
                                    <th className="pb-4">Asset Name</th>
                                    <th className="pb-4">Operator</th>
                                    <th className="pb-4">Size</th>
                                    <th className="pb-4 text-right">Yield</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {revenueByProperty.slice(0, 5).map((prop, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5 font-black text-[var(--color-secondary)] text-sm">{prop.propertyName}</td>
                                        <td className="py-5 text-[var(--text-muted)] text-[10px] font-black uppercase opacity-60">{prop.ownerName}</td>
                                        <td className="py-5 text-[var(--text-muted)] text-[11px] font-bold opacity-60">{prop.units} Units</td>
                                        <td className="py-5 text-right font-black text-blue-600 text-sm">{formatCurrency(prop.monthlyRevenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 4️⃣ Monthly Revenue Trend */}
                <div className="lg:col-span-2 bg-white border border-gray-100 p-10 rounded-[2.5rem] space-y-8 shadow-sm overflow-hidden relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-50 blur-[80px] rounded-full opacity-50"></div>
                    <h3 className="text-lg font-black text-[var(--color-secondary)] uppercase tracking-widest flex items-center gap-4 relative z-10">
                        <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                        monthly Revenue Trend
                    </h3>
                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyRevenueTrend}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(val) => formatCurrency(val)}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={4} fill="url(#areaGrad)" dot={{ fill: '#a855f7', r: 5, strokeWidth: 0 }} activeDot={{ r: 7 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5️⃣ Occupancy Flow */}
                <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-8 left-8">
                        <h3 className="text-lg font-black text-[var(--color-secondary)] uppercase tracking-widest flex items-center gap-4">
                            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                            Utilization
                        </h3>
                    </div>
                    <div className="relative w-64 h-64 mt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={10}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-[var(--color-secondary)] tracking-tighter">{occupancyStats.occupancyRate}%</span>
                            <span className="text-[var(--text-muted)] text-[10px] uppercase font-black  mt-2 opacity-60">Avg. Utilization</span>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100/50 text-center">
                            <p className="text-emerald-700 text-[9px] uppercase font-black tracking-widest mb-1">Occupied</p>
                            <p className="text-2xl font-black text-emerald-600 tracking-tighter">{occupancyStats.occupiedUnits}</p>
                        </div>
                        <div className="bg-rose-50/50 p-5 rounded-[2rem] border border-rose-100/50 text-center">
                            <p className="text-rose-700 text-[9px] uppercase font-black tracking-widest mb-1">Vacant</p>
                            <p className="text-2xl font-black text-rose-600 tracking-tighter">{occupancyStats.vacantUnits}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6️⃣ Pending Rent Report */}
            <section className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-6 sm:p-10 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-black text-[var(--color-secondary)] uppercase tracking-widest flex items-center gap-4">
                        <span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>
                        pending Rent Report
                    </h3>
                </div>
                <div className="hidden lg:block overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase tracking-widest font-black text-[var(--text-muted)] bg-gray-50/50 opacity-60">
                            <tr>
                                <th className="px-6 sm:px-10 py-6">Tenant Name</th>
                                <th className="px-6 sm:px-10 py-6">Property Name</th>
                                <th className="px-6 sm:px-10 py-6">Rent Due</th>
                                <th className="px-6 sm:px-10 py-6 text-center">delay</th>
                                <th className="px-6 sm:px-10 py-6 text-right">Operational Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pendingRentReport.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 group transition-colors">
                                    <td className="px-6 sm:px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center text-xs font-black text-[var(--color-secondary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all">
                                                {item.tenant[0]}
                                            </div>
                                            <span className="font-black text-[var(--color-secondary)] text-sm">{item.tenant}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 sm:px-10 py-6 text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest opacity-60">{item.property}</td>
                                    <td className="px-6 sm:px-10 py-6 font-black text-[var(--color-secondary)] text-lg tracking-tighter">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 sm:px-10 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${item.daysLate > 30 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {item.daysLate}d
                                        </span>
                                    </td>
                                    <td className="px-6 sm:px-10 py-6 text-right">
                                        <Button variant="ghost" size="xs" className="cursor-pointer">Escalate</Button>
                                    </td>
                                </tr>
                            ))}
                            {pendingRentReport.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                                                <TrendingUp size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-[var(--color-secondary)] text-xl tracking-tight uppercase">Perfect Liquidity</p>
                                                <p className="text-[var(--text-muted)] text-sm font-medium">No pending rent found across the platform network.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden p-4 space-y-4 bg-gray-50/50 rounded-b-[2.5rem]">
                    {pendingRentReport.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="font-black text-[var(--color-secondary)] text-lg tracking-tight uppercase">Perfect Liquidity</p>
                        </div>
                    ) : (
                        pendingRentReport.map((item, idx) => (
                            <div key={idx} className="p-6 bg-white border border-gray-100 rounded-[2rem] space-y-4 shadow-md hover:shadow-xl transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xs font-black text-[var(--color-secondary)]">
                                            {item.tenant[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-[var(--color-secondary)] text-sm">{item.tenant}</p>
                                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">{item.property}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${item.daysLate > 30 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {item.daysLate}d late
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <p className="font-black text-[var(--color-secondary)] text-lg">{formatCurrency(item.amount)}</p>
                                    <Button variant="ghost" size="xs" className="cursor-pointer">Escalate</Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default SuperAdminRevenueReport;
