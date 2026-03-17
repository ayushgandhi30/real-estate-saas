import React, { useState, useEffect } from "react";
import {
    DollarSign,
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
    Activity
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
} from "recharts";
import { useAuth } from "../store/auth";

const SuperAdminRevenueReport = () => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:7000/api/admin/revenue-stats", {
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
                    <div className="absolute inset-0 border-4 border-[var(--color-primary)]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-10 text-white">No data available</div>;

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
        { title: "Total Rent Collected", value: summaryCards.totalRent, icon: Home, color: "from-blue-600 to-indigo-500" },
        { title: "Maintenance Collected", value: summaryCards.totalMaintenance, icon: Wrench, color: "from-emerald-500 to-teal-400" },
        { title: "Utility Collected", value: summaryCards.totalUtility, icon: UtilityPole, color: "from-amber-500 to-orange-400" },
        { title: "Total Revenue", value: summaryCards.totalRevenue, icon: DollarSign, color: "from-purple-600 to-pink-500" },
        { title: "Pending Rent", value: summaryCards.pendingRent, icon: Clock, color: "from-rose-500 to-red-400" },
    ];

    const pieData = [
        { name: 'Occupied', value: occupancyStats.occupiedUnits, color: '#10b981' },
        { name: 'Vacant', value: occupancyStats.vacantUnits, color: '#f43f5e' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-white p-6 space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Activity className="text-[var(--color-primary)]" />
                        Platform Revenue Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Comprehensive financial overview across all owners and properties.</p>
                </div>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl transition-all font-bold group">
                    <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                    <span>Download PDF Report</span>
                </button>
            </header>

            {/* 1️⃣ Revenue Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {statsConfig.map((stat, idx) => (
                    <div key={idx} className="bg-[#1D2B3F] border border-white/10 p-6 rounded-3xl hover:border-[var(--color-primary)]/50 transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl rounded-full -mr-10 -mt-10`}></div>
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                            <stat.icon size={22} className="text-white" />
                        </div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.title}</p>
                        <h3 className="text-2xl font-black">{formatCurrency(stat.value)}</h3>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2️⃣ Revenue by Owner */}
                <div className="bg-[#1D2B3F] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Users className="text-blue-400" /> Revenue by Owner
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByOwner}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="ownerName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(val) => formatCurrency(val)}
                                />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] uppercase font-black text-slate-500 border-b border-white/5">
                                <tr>
                                    <th className="pb-4">Owner</th>
                                    <th className="pb-4">Props</th>
                                    <th className="pb-4">Units</th>
                                    <th className="pb-4 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {revenueByOwner.map((owner, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.02]">
                                        <td className="py-4 font-bold">{owner.ownerName}</td>
                                        <td className="py-4 text-slate-400">{owner.propertyCount}</td>
                                        <td className="py-4 text-slate-400">{owner.totalUnits}</td>
                                        <td className="py-4 text-right font-black text-emerald-400">{formatCurrency(owner.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3️⃣ Revenue by Property */}
                <div className="bg-[#1D2B3F] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Building2 className="text-emerald-400" /> Revenue by Property
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByProperty} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                                <YAxis dataKey="propertyName" type="category" stroke="#94a3b8" fontSize={10} width={100} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                    formatter={(val) => formatCurrency(val)}
                                />
                                <Bar dataKey="monthlyRevenue" fill="#10b981" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] uppercase font-black text-slate-500 border-b border-white/5">
                                <tr>
                                    <th className="pb-4">Property</th>
                                    <th className="pb-4">Owner</th>
                                    <th className="pb-4">Units</th>
                                    <th className="pb-4 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {revenueByProperty.slice(0, 5).map((prop, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.02]">
                                        <td className="py-4 font-bold">{prop.propertyName}</td>
                                        <td className="py-4 text-slate-400 text-xs">{prop.ownerName}</td>
                                        <td className="py-4 text-slate-400 text-xs">{prop.units}</td>
                                        <td className="py-4 text-right font-black text-blue-400">{formatCurrency(prop.monthlyRevenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 4️⃣ Monthly Revenue Trend */}
                <div className="lg:col-span-2 bg-[#1D2B3F] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <TrendingUp className="text-purple-400" /> Platform Growth Trend
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyRevenueTrend}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                    formatter={(val) => formatCurrency(val)}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={4} dot={{ fill: '#a855f7', r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5️⃣ Occupancy vs Revenue */}
                <div className="bg-[#1D2B3F] border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-4 left-6">
                         <h3 className="text-xl font-bold flex items-center gap-3">
                            <PieChart className="text-amber-400" /> Occupancy Mix
                        </h3>
                    </div>
                    <div className="relative w-64 h-64 mt-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black">{occupancyStats.occupancyRate}%</span>
                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Rate</span>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Occupied</p>
                            <p className="text-xl font-black text-emerald-400">{occupancyStats.occupiedUnits}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Vacant</p>
                            <p className="text-xl font-black text-rose-400">{occupancyStats.vacantUnits}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6️⃣ Pending Rent Report */}
            <section className="bg-[#1D2B3F] border border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <Clock className="text-rose-400" /> Pending Collection Report
                    </h3>
                    <span className="bg-rose-500/10 text-rose-400 text-xs font-black px-4 py-1.5 rounded-full border border-rose-500/20">
                        {pendingRentReport.length} Outstanding Invoices
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                            <tr>
                                <th className="px-10 py-6">Tenant</th>
                                <th className="px-10 py-6">Property</th>
                                <th className="px-10 py-6">Amount</th>
                                <th className="px-10 py-6">Duration</th>
                                <th className="px-10 py-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pendingRentReport.map((item, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] group transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                                                {item.tenant[0]}
                                            </div>
                                            <span className="font-bold">{item.tenant}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-slate-400 text-sm">{item.property}</td>
                                    <td className="px-10 py-6 font-black text-white">{formatCurrency(item.amount)}</td>
                                    <td className="px-10 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.daysLate > 30 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                            {item.daysLate} Days Late
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button className="text-[var(--color-primary)] text-xs font-bold hover:underline">Send Reminder</button>
                                    </td>
                                </tr>
                            ))}
                            {pendingRentReport.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <TrendingUp size={32} />
                                            </div>
                                            <p className="font-bold">Excellent! No pending rent found across the platform.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default SuperAdminRevenueReport;
