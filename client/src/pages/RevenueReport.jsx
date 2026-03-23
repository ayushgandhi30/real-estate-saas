import React, { useState } from "react";
import {
    IndianRupee,
    Calendar,
    BarChart3,
    Receipt,
    TrendingUp,
    Download,
    MoreVertical
} from "lucide-react";
import {
    AreaChart,
    Area,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { useAuth } from "../store/auth";
import Button from "../components/ui/Button";

const RevenueReport = () => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    const formatToRupee = (val) => {
        if (!val) return "₹0";
        if (typeof val === 'string') {
            return val.replace('$', '₹');
        }
        return `₹${val.toLocaleString()}`;
    };

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:7000/api/owner/revenue-stats", {
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
                console.error("Error fetching revenue stats:", error);
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    const { stats, transactions, efficiency, breakdown } = data || {
        stats: { totalRevenue: 0, monthlyRevenue: 0, occupancyRate: "0%", pendingRent: 0, netProfit: 0 },
        transactions: [],
        efficiency: 0,
        breakdown: {
            rent: { collected: 0, pending: 0, lateFees: 0 }
        }
    };

    const statsConfig = [
        { title: "Total Revenue", value: formatToRupee(stats.totalRevenue), icon: IndianRupee, color: "bg-blue-50 text-blue-600" },
        { title: "Monthly Revenue", value: formatToRupee(stats.monthlyRevenue), icon: Calendar, color: "bg-indigo-50 text-indigo-600" },
        { title: "Occupancy Rate", value: stats.occupancyRate, icon: BarChart3, color: "bg-emerald-50 text-emerald-600" },
        { title: "Pending Rent", value: formatToRupee(stats.pendingRent), icon: IndianRupee, color: "bg-rose-50 text-rose-600" },
    ];

    const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 3);

    const pulseData = [
        { name: 'Mon', value: 4000 },
        { name: 'Tue', value: 3000 },
        { name: 'Wed', value: 5000 },
        { name: 'Thu', value: 2780 },
        { name: 'Fri', value: 1890 },
        { name: 'Sat', value: 2390 },
        { name: 'Sun', value: 3490 },
    ];

    const occupancyMixData = [
        { name: 'Occupied', value: efficiency || 75, color: '#10b981' },
        { name: 'Vacant', value: 100 - (efficiency || 75), color: '#f59e0b' }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-secondary)] p-4 sm:p-6 lg:p-0 space-y-5 selection:bg-[var(--color-primary)]/30 font-['Inter']">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="font-black text-[var(--color-secondary)] tracking-tight">
                        Revenue Report
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="secondary" size="md" icon={<Download size={18} />}>
                        Export Report
                    </Button>
                </div>
            </header>

            {/* --- MAIN KPI GRID --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </section>

            {/* --- CORE INSIGHTS & BREAKDOWNS --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Net Profit Hero */}
                <div className="xl:col-span-2">
                    <div className="relative group overflow-hidden bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] h-full">
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--color-primary)]/5 blur-[100px] rounded-full group-hover:bg-[var(--color-primary)]/10 transition-all duration-700"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                            <div className="flex-1 flex flex-col justify-center">
                                <span className="text-sm font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">Total Net Profit</span>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl font-black text-[var(--color-secondary)] tracking-tighter">{formatToRupee(stats.netProfit)}</span>
                                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-black italic">
                                        <TrendingUp size={14} /> ACTIVE GROWTH
                                    </div>
                                </div>
                                <p className="text-[var(--text-muted)] mt-6 text-sm max-w-md font-medium leading-relaxed italic opacity-80">"Intelligence is the ability to adapt to change. Watch your yield grow."</p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-3 pr-4">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f8fafc" strokeWidth="12" />
                                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="url(#revenueGrad)" strokeWidth="12" strokeDasharray="440" strokeDashoffset={440 * (1 - (efficiency || 0) / 100)} strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="var(--color-primary)" />
                                                <stop offset="100%" stopColor="#ff7675" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-[var(--color-secondary)] leading-none">{efficiency}%</span>
                                        <span className="text-[10px] uppercase font-black text-[var(--text-muted)] mt-2 tracking-widest text-center">Efficiency</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown Summary Sidecar */}
                <div className="xl:col-span-1">
                    <SummaryCard
                        title="Rent Income"
                        icon={Receipt}
                        items={[
                            { label: "Collected", value: formatToRupee(breakdown.rent.collected), color: "text-emerald-600" },
                            { label: "Pending", value: formatToRupee(breakdown.rent.pending), color: "text-rose-600" },
                            { label: "Late Fees", value: formatToRupee(breakdown.rent.lateFees) }
                        ]}
                    />
                </div>
            </div>

            {/* --- ANALYTICS LAYER (NEW SIDE-BY-SIDE LAYOUT) --- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MiniChartSection title="Revenue Pulse" type="area" chartData={pulseData} />
                <MiniChartSection title="Occupancy Mix" type="pie" chartData={occupancyMixData} />
            </section>

            {/* --- TRANSACTION TABLE --- */}
            <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)]">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full"></div>
                        <h3 className="text-xl font-black text-[var(--color-secondary)] tracking-tight">Transaction History</h3>
                    </div>
                    <Button variant="ghost" size="xs" onClick={() => setShowAllTransactions(!showAllTransactions)}>
                        {showAllTransactions ? "Show Less" : "See All"}
                    </Button>
                </div>

                {/* Desktop/Tablet view */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase tracking-[0.2em] font-black text-[var(--text-muted)] bg-gray-50/50">
                            <tr>
                                <th className="px-10 py-5">Date</th>
                                <th className="px-10 py-5">Identity</th>
                                <th className="px-10 py-5">Unit</th>
                                <th className="px-10 py-5">Invoice</th>
                                <th className="px-10 py-5 text-right">Settlement</th>
                                <th className="px-10 py-5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {displayedTransactions.map((t, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors group cursor-default">
                                    <td className="px-10 py-8 whitespace-nowrap text-[13px] font-bold text-[var(--text-muted)]">{t.date}</td>
                                    <td className="px-10 py-8 whitespace-nowrap">
                                        <div className="font-black text-[var(--color-secondary)] group-hover:text-[var(--color-primary)] transition-colors">{t.tenant}</div>
                                    </td>
                                    <td className="px-10 py-8 whitespace-nowrap text-xs font-black text-[var(--text-muted)] tracking-widest uppercase opacity-60">{t.unit}</td>
                                    <td className="px-10 py-8 whitespace-nowrap">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] bg-gray-100 px-2 py-1 rounded lowercase">{t.invoice}</span>
                                    </td>
                                    <td className="px-10 py-8 whitespace-nowrap text-right font-black text-[var(--color-secondary)] text-lg">{formatToRupee(t.amount)}</td>
                                    <td className="px-10 py-8 whitespace-nowrap text-center">
                                        <StatusPill status={t.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view */}
                <div className="lg:hidden p-4 space-y-4 bg-gray-50/50 rounded-b-[2.5rem]">
                    {displayedTransactions.map((t, i) => (
                        <div key={i} className="group p-6 bg-white border border-gray-100 rounded-[2.5rem] space-y-5 shadow-md hover:shadow-2xl transition-all relative overflow-hidden">
                            {/* Status Accent Bar */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${t.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            
                            <div className="flex justify-between items-start pl-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg group-hover:scale-110 transition-transform">
                                        {t.tenant[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-[var(--color-secondary)] text-base tracking-tight">{t.tenant}</p>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-0.5">{t.date}</p>
                                    </div>
                                </div>
                                <StatusPill status={t.status} />
                            </div>

                            <div className="flex items-center justify-between bg-gray-50/50 p-5 rounded-2xl border border-gray-100 ml-2">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Revenue Unit</p>
                                    <p className="text-xs font-bold text-[var(--color-secondary)]">{t.unit}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Settlement</p>
                                    <p className="text-lg font-black text-[var(--color-secondary)]">{formatToRupee(t.amount)}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-center ml-2">
                                <span className="text-[10px] font-black text-[var(--text-muted)] bg-gray-100 px-4 py-1.5 rounded-full lowercase tracking-widest opacity-60">
                                    {t.invoice}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

/* --- ENHANCED HELPER COMPONENTS --- */

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="premium-card rounded-[2.5rem] p-1.5 group">
        <div className="bg-white p-6 rounded-[2.2rem]">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={22} />
            </div>
            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
            <h3 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight">{value}</h3>
        </div>
    </div>
);

const SummaryCard = ({ title, items, icon: Icon }) => (
    <div className="bg-white border border-gray-50 p-8 rounded-[2rem] group hover:border-[var(--color-primary)]/20 transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gray-50 rounded-2xl text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <Icon size={20} />
            </div>
            <h3 className="font-black text-[var(--color-secondary)] text-lg tracking-tight uppercase text-xs tracking-widest">{title}</h3>
        </div>
        <div className="space-y-6">
            {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-end group/item">
                    <span className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest opacity-60 group-hover/item:opacity-100 transition-opacity">
                        {item.label}
                    </span>
                    <span className={`font-black tracking-tight ${item.color || "text-[var(--color-secondary)]"}`}>
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

const StatusPill = ({ status }) => {
    const isPaid = status === "Paid";
    return (
        <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] uppercase font-black tracking-[0.1em] border ${isPaid
            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
            : "bg-amber-50 text-amber-600 border-amber-100"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-600" : "bg-amber-600"}`}></span>
            {status}
        </span>
    );
};

const MiniChartSection = ({ title, type, chartData }) => (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 h-64 flex flex-col group overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60 group-hover:opacity-100 transition-opacity">{title}</h3>
            <MoreVertical size={14} className="text-[var(--text-muted)] opacity-30" />
        </div>
        <div className="flex-1 w-full">
            {type === "area" ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorPulse)" strokeWidth={3} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            labelStyle={{ display: 'none' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    </div>
);

export default RevenueReport;
