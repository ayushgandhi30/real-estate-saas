import React, { useEffect, useState } from "react";
import { FileText, Home, User, Calendar, CreditCard, Search, Loader2, AlertCircle, MapPin, Building2, Filter } from "lucide-react";
import { useAuth } from "../store/auth";

export default function LeaseAgrement() {
    const { token } = useAuth();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const fetchTenants = async () => {
        try {
            const response = await fetch("http://localhost:7000/api/tenant/tenants", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTenants(data.tenants);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to fetch lease records");
            }
        } catch (err) {
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTenants();
        }
    }, [token]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const filteredTenants = tenants.filter(tenant => {
        const name = tenant.userId?.name || tenant.name || "";
        const property = tenant.propertyId?.propertyName || "";
        const unit = tenant.unitId?.unitNumber || "";

        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === "All" || tenant.leaseStatus === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
                    <p className="text-[var(--text-secondary)] font-medium animate-pulse">Retrieving Digital Agreements...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] p-8 flex items-center justify-center">
                <div className="bg-[var(--bg-card)] border border-red-500/30 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl backdrop-blur-xl">
                    <AlertCircle className="mx-auto text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" size={64} />
                    <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Access Error</h2>
                    <p className="text-[var(--text-card)] mb-8 leading-relaxed">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
                    >
                        Re-authenticate
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-secondary)] p-2 md:p-2 font-[var(--font-body)]">

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                        Lease Management
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-card)] group-focus-within:text-[var(--color-primary)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find tenant or unit..."
                            className="bg-[var(--bg-card)] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border-r border-white/10 mr-1">
                            <Filter size={14} /> Status
                        </div>
                        {["All", "Active", "Expiring", "Expired"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterStatus === status
                                    ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25"
                                    : "text-[var(--text-card)] hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lease Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredTenants.length > 0 ? (
                    filteredTenants.map((tenant) => (
                        <div key={tenant._id} className="group bg-[var(--bg-card)] rounded-[2.5rem] p-8 border border-white/[0.03] shadow-2xl hover:border-[var(--color-primary)]/30 hover:bg-white/[0.02] transition-all duration-500 relative overflow-hidden flex flex-col">

                            {/* Status Ribbon */}
                            <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${tenant.leaseStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-l border-b border-emerald-500/30' :
                                tenant.leaseStatus === 'Expiring' ? 'bg-amber-500/20 text-amber-400 border-l border-b border-amber-500/30' :
                                    'bg-rose-500/20 text-rose-400 border-l border-b border-rose-500/30'
                                }`}>
                                {tenant.leaseStatus}
                            </div>

                            {/* Header: Tenant Info */}
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-xl group-hover:scale-110 transition-transform duration-500">
                                    {(tenant.userId?.name || tenant.name)?.[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-black text-white truncate max-w-[200px] tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
                                        {tenant.userId?.name || tenant.name}
                                    </h3>
                                    <p className="text-[10px] font-black text-[var(--text-card)] uppercase tracking-widest mt-1">Tenant Account Holder</p>
                                </div>
                            </div>

                            {/* Section 1: Property Logic */}
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-3xl border border-white/[0.02]">
                                    <div className="bg-[var(--color-primary)]/10 p-2.5 rounded-2xl">
                                        <Home className="text-[var(--color-primary)]" size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{tenant.propertyId?.propertyName}</p>
                                        <div className="flex items-center gap-1.5 text-[var(--text-card)] mt-0.5">
                                            <MapPin size={10} />
                                            <p className="text-[10px] font-bold uppercase tracking-tight truncate">{tenant.propertyId?.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/[0.03] rounded-3xl border border-white/[0.02]">
                                        <p className="text-[10px] font-black uppercase text-[var(--text-card)] tracking-widest mb-1">Unit ID</p>
                                        <p className="text-white font-black text-lg">#{tenant.unitId?.unitNumber}</p>
                                    </div>
                                    <div className="p-4 bg-white/[0.03] rounded-3xl border border-white/[0.02]">
                                        <p className="text-[10px] font-black uppercase text-[var(--text-card)] tracking-widest mb-1">Floor Level</p>
                                        <p className="text-white font-bold">{tenant.floorId?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Financial Terms */}
                            <div className="p-6 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-3xl border border-[var(--color-primary)]/10 mb-8">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-2 text-[var(--text-card)] font-bold text-xs uppercase tracking-widest">
                                        <CreditCard size={14} /> Monthly Rent
                                    </div>
                                    <span className="text-xl font-black text-[var(--color-primary)]">{formatCurrency(tenant.rent)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[var(--text-card)] font-bold text-xs uppercase tracking-widest">
                                        <Calendar size={14} /> Lease Term
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-white">{formatDate(tenant.leaseStart)}</p>
                                        <p className="text-[10px] font-bold text-[var(--text-card)] uppercase mt-0.5">to {formatDate(tenant.leaseEnd)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Meta Data */}
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">Security Deposit</p>
                                    <p className="text-sm font-bold text-white/80">{formatCurrency(tenant.deposit)}</p>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">Manager</p>
                                    <p className="text-sm font-bold text-white/80 text-right truncate w-full">{tenant.managerId?.name || "Global Admin"}</p>
                                </div>
                            </div>

                            {/* Interactive Background Glow */}
                            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/20 transition-all duration-500"></div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 flex flex-col items-center gap-6 bg-[var(--bg-card)]/50 rounded-[4rem] border border-white/5 border-dashed">
                        <div className="p-8 bg-white/5 rounded-full relative">
                            <FileText size={64} className="text-[var(--text-card)]/30" />
                            <div className="absolute inset-0 border-2 border-[var(--color-primary)]/20 rounded-full animate-ping"></div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-white/40 mb-2">No Lease Records Found</h3>
                            <p className="text-[var(--text-card)] text-sm font-medium">Try adjusting your search query or filter criteria.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination / Footer Info */}
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">
                <p>Showing {filteredTenants.length} lease agreements identified in database</p>
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Data Synchronized
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--color-primary);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
