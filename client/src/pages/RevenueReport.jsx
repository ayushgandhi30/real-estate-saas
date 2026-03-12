import React from "react";
import {
    DollarSign,
    Calendar,
    Home,
    BarChart3,
    Receipt,
    Wrench,
    TrendingUp,
    Download,
    ChevronDown,
    MoreVertical,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useAuth } from "../store/auth";

const RevenueReport = () => {
    const { token } = useAuth();
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

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
        stats: { totalRevenue: "₹0", monthlyRevenue: "₹0", occupancyRate: "0%", pendingRent: "₹0", netProfit: "₹0" },
        transactions: [],
        efficiency: 0,
        breakdown: {
            rent: { collected: "₹0", pending: "₹0", lateFees: "₹0" },
            other: { parking: "₹0", utilities: "₹0", services: "₹0" },
            expenses: { maintenance: "₹0", repairs: "₹0", utilities: "₹0" }
        }
    };

    const statsConfig = [
        { title: "Total Revenue", value: stats.totalRevenue, change: "+0%", trending: "up", icon: DollarSign, color: "from-blue-500 to-cyan-400" },
        { title: "Monthly Revenue", value: stats.monthlyRevenue, change: "+0%", trending: "up", icon: Calendar, color: "from-indigo-500 to-purple-400" },
        { title: "Occupancy Rate", value: stats.occupancyRate, change: "+0%", trending: "up", icon: BarChart3, color: "from-emerald-500 to-teal-400" },
        { title: "Pending Rent", value: stats.pendingRent, change: "+0%", trending: "down", icon: Receipt, color: "from-rose-500 to-orange-400" },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-secondary)] p-6 md:p-0 space-y-10 selection:bg-[var(--color-primary)]/30">

            {/* --- HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        Revenue Analytics
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        <FilterOption label="Quarterly" active />
                        <FilterOption label="Yearly" />
                    </div>
                    <button className="group flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:shadow-[0_0_20px_rgba(0,161,255,0.4)] transition-all duration-300 px-6 py-3 rounded-2xl text-black font-bold">
                        <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                        <span>Export Report</span>
                    </button>
                </div>
            </header>

            {/* --- MAIN KPI GRID --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </section>

            {/* --- CORE INSIGHTS --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left: Net Profit Hero & Breakdowns */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Net Profit Card */}
                    <div className="relative group overflow-hidden bg-[#1D2B3F] rounded-[2rem] p-10 border border-white/10 shadow-2xl">
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--color-primary)]/10 blur-[100px] rounded-full group-hover:bg-[var(--color-primary)]/20 transition-all duration-700"></div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <h2 className="text-xl font-medium text-[var(--text-card)] mb-2">Total Net Profit</h2>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-6xl font-black text-white tracking-tighter">{stats.netProfit}</span>
                                    <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm font-bold">
                                        <TrendingUp size={16} /> 0%
                                    </div>
                                </div>
                                <p className="text-white/40 mt-4 text-sm max-w-md">Your net profit is calculated AFTER maintenance and expenses. Keep track of your overheads!</p>
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="url(#gradient)" strokeWidth="8" strokeDasharray="364" strokeDashoffset={364 * (1 - (efficiency || 0) / 100)} strokeLinecap="round" />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#00a1ff" />
                                                <stop offset="100%" stopColor="#00ffcc" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-white leading-none">{efficiency}%</span>
                                        <span className="text-[10px] uppercase font-bold text-white/40 mt-1 tracking-widest text-center px-4">Occupancy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SummaryCard
                            title="Rent Income"
                            icon={Receipt}
                            items={[
                                { label: "Collected", value: breakdown.rent.collected, color: "text-emerald-400" },
                                { label: "Pending", value: breakdown.rent.pending, color: "text-rose-400" },
                                { label: "Late Fees", value: breakdown.rent.lateFees }
                            ]}
                        />
                        <SummaryCard
                            title="Other Income"
                            icon={DollarSign}
                            items={[
                                { label: "Parking", value: breakdown.other.parking },
                                { label: "Utilities", value: breakdown.other.utilities },
                                { label: "Services", value: breakdown.other.services }
                            ]}
                        />
                        <SummaryCard
                            title="Expenses"
                            icon={Wrench}
                            items={[
                                { label: "Property Maint.", value: breakdown.expenses.maintenance },
                                { label: "Repairs", value: breakdown.expenses.repairs, color: "text-amber-400" },
                                { label: "Utilities", value: breakdown.expenses.utilities }
                            ]}
                        />
                    </div>
                </div>

                {/* Right: Charts Sidecar */}
                <div className="space-y-6">
                    <MiniChartSection title="Revenue Pulse" />
                    <MiniChartSection title="Occupancy Mix" />

                </div>
            </div>

            {/* --- TRANSACTION TABLE --- */}
            <section className="bg-[#1a2537]/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[var(--color-primary)] rounded-full"></div>
                        <h3 className="text-xl font-bold">Transaction History</h3>
                    </div>
                    <button className="px-4 py-2 hover:bg-white/5 rounded-xl transition-colors text-sm font-semibold">See All</button>
                </div>

                {/* Desktop/Tablet view */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30">
                            <tr>
                                <th className="px-10 py-6">Date</th>
                                <th className="px-10 py-6">Identity</th>
                                <th className="px-10 py-6">Unit</th>
                                <th className="px-10 py-6">Invoice</th>
                                <th className="px-10 py-6 text-right">Settlement</th>
                                <th className="px-10 py-6">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {transactions.map((t, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                                    <td className="px-10 py-8 whitespace-nowrap text-sm text-white/60">{t.date}</td>
                                    <td className="px-10 py-8 whitespace-nowrap">
                                        <div className="font-bold text-white group-hover:text-[var(--color-primary)] transition-colors">{t.tenant}</div>
                                    </td>
                                    <td className="px-10 py-8 whitespace-nowrap text-xs font-bold text-white/40 tracking-widest">{t.unit}</td>
                                    <td className="px-10 py-8 whitespace-nowrap text-[10px] font-mono text-white/30 bg-white/5 px-2 py-1 rounded w-fit">{t.invoice}</td>
                                    <td className="px-10 py-8 whitespace-nowrap text-right font-black text-lg">{t.amount}</td>
                                    <td className="px-10 py-8 whitespace-nowrap">
                                        <StatusPill status={t.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile / Tablet view */}
                <div className="md:hidden p-4 space-y-4">
                    {transactions.map((t, i) => (
                        <div key={i} className="p-6 space-y-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-colors shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-white text-lg">{t.tenant}</div>
                                    <div className="text-xs text-white/40 mt-1">{t.date} • Unit {t.unit}</div>
                                </div>
                                <StatusPill status={t.status} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-1 rounded">{t.invoice}</div>
                                <div className="font-black text-xl text-white">{t.amount}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

/* --- ENHANCED HELPER COMPONENTS --- */

const StatCard = ({ title, value, change, trending, icon: Icon, color }) => (
    <div className="relative group bg-[#1D2B3F] border border-white/10 p-2 rounded-[2.5rem] hover:border-[var(--color-primary)]/40 transition-all duration-500 hover:-translate-y-2 shadow-lg">
        <div className="bg-[#162130] p-6 rounded-[2.2rem]">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={22} className="text-white" />
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-white">{value}</h3>
            <div className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${trending === "up" ? "text-emerald-400" : "text-rose-400"}`}>
                <div className={`p-1 rounded-full ${trending === "up" ? "bg-emerald-400/10" : "bg-rose-400/10"}`}>
                    {trending === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
                {change}
            </div>
        </div>
    </div>
);

const SummaryCard = ({ title, items, icon: Icon }) => (
    <div className="bg-[#1D2B3F] border border-white/5 p-8 rounded-[2rem] group hover:border-white/20 transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/5 rounded-2xl text-[var(--color-primary)]">
                <Icon size={20} />
            </div>
            <h3 className="font-extrabold text-white text-lg tracking-tight">{title}</h3>
        </div>
        <div className="space-y-6">
            {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-end group/item">
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest group-hover/item:text-white/60 transition-colors">
                        {item.label}
                    </span>
                    <span className={`font-black tracking-tight ${item.color || "text-white"}`}>
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

const FilterOption = ({ label, active }) => (
    <button className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${active ? "bg-[var(--color-primary)] text-black shadow-lg shadow-blue-500/20" : "text-white/40 hover:text-white"}`}>
        {label}
    </button>
);

const StatusPill = ({ status }) => {
    const isPaid = status === "Paid";
    return (
        <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] uppercase font-black tracking-[0.1em] border ${isPaid
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`}></span>
            {status}
        </span>
    );
};

const MiniChartSection = ({ title }) => (
    <div className="bg-[#1D2B3F] border border-white/5 rounded-[2rem] p-6 h-48 flex flex-col group overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">{title}</h3>
            <MoreVertical size={14} className="text-white/20" />
        </div>
        <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2 border-b border-white/5">
            {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 w-full bg-indigo-500/10 rounded-t-lg group-hover:bg-[var(--color-primary)] group-hover:shadow-[0_0_15px_rgba(0,161,255,0.3)] transition-all duration-500"
                />
            ))}
        </div>
    </div>
);

export default RevenueReport;

