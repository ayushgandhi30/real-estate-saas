import React, { useEffect, useState } from "react";
import {
    FileText,
    Search,
    Loader2,
    AlertCircle,
    Building2,
    Filter,
    ArrowUpDown,
    User,
    Calendar,
    MapPin,
    IndianRupee,
    ChevronDown,
    X,
    Eye,
    Phone,
    ShieldCheck,
    Clock,
    CreditCard,
    Info
} from "lucide-react";
import { useAuth } from "../store/auth";

export default function LeaseAgrement() {
    const { token } = useAuth();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedLease, setSelectedLease] = useState(null);

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
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
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

    const calculateDuration = (start, end) => {
        if (!start || !end) return "N/A";
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30.44));
        return `${diffMonths} Months`;
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
                <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 md:p-6 lg:p-2 font-[var(--font-body)]">

            <div className="max-w-[1500px] mx-auto">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Lease Agreements</h1>
                        <p className="text-[10px] font-black text-[var(--text-card)] uppercase tracking-[0.2em]">Live Inventory • {filteredTenants.length} Records</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative group w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-card)]" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-[var(--bg-card)] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-[var(--text-secondary)]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-white/5">
                            {["All", "Active", "Expiring"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                        ? "bg-[var(--color-primary)] text-white"
                                        : "text-[var(--text-card)] hover:text-white"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[var(--bg-card)] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-5 text-[12px] font-black text-[var(--text-card)] uppercase tracking-widest whitespace-nowrap">Tenant</th>
                                    <th className="px-8 py-5 text-[12px] font-black text-[var(--text-card)] uppercase tracking-widest whitespace-nowrap">Property / Unit</th>
                                    <th className="px-8 py-5 text-[12px] font-black text-[var(--text-card)] uppercase tracking-widest whitespace-nowrap">Period</th>
                                    <th className="px-8 py-5 text-[12px] font-black text-[var(--text-card)] uppercase tracking-widest whitespace-nowrap">Monthly Rent</th>
                                    <th className="px-8 py-5 text-[12px] font-black text-[var(--text-card)] uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="px-8 py-5 text-[12px] font-black text-[var(--text-card)] uppercase tracking-widest whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filteredTenants.map((tenant) => (
                                    <tr key={tenant._id} className="hover:bg-white/[0.01] transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">

                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{tenant.userId?.name || tenant.name}</p>
                                                    <p className="text-[10px] text-[var(--text-card)] font-medium truncate max-w-[150px]">{tenant.userId?.email || tenant.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-white">{tenant.propertyId?.propertyName}</p>
                                                <p className="text-[10px] text-[var(--text-card)] font-black uppercase">Unit {tenant.unitId?.unitNumber} • {tenant.floorId?.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-white/80">{formatDate(tenant.leaseStart)}</p>
                                            <p className="text-[10px] text-[var(--text-card)] font-bold uppercase mt-0.5">to {formatDate(tenant.leaseEnd)}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-[var(--color-primary)]">
                                            {formatCurrency(tenant.rent)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${tenant.leaseStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}>
                                                <span className={`w-1 h-1 rounded-full ${tenant.leaseStatus === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                                {tenant.leaseStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => setSelectedLease(tenant)}
                                                className="p-2 rounded-full bg-white/5 group-hover:bg-[var(--color-primary)]/10 text-[var(--text-card)] group-hover:text-[var(--color-primary)] transition-all"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detailed View Modal (Drawer Style) */}
            {selectedLease && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedLease(null)}
                    />
                    <div className="relative w-full max-w-xl bg-[var(--bg-main)] shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-white/5">

                        {/* Drawer Header */}
                        <div className="sticky top-0 bg-[var(--bg-main)]/80 backdrop-blur-md z-10 px-8 py-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Lease Agreement</h2>
                                <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest mt-0.5">ID: #{selectedLease._id.slice(-8).toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLease(null)}
                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-10 custom-scrollbar pb-20">

                            {/* 1. Tenant Information */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="text-[var(--color-primary)]" size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">1. Tenant Information</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6 bg-[var(--bg-card)] p-6 rounded-3xl border border-white/5">
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Full Name</p>
                                        <p className="text-sm font-bold text-white">{selectedLease.userId?.name || selectedLease.name}</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Email Address</p>
                                        <p className="text-sm font-bold text-white truncate">{selectedLease.userId?.email || selectedLease.email || "Not Provided"}</p>
                                    </div>
                                    <div className="md:col-span-1">
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Phone Number</p>
                                        <p className="text-sm font-bold text-white">{selectedLease.userId?.phone || selectedLease.phone || "Not Provided"}</p>
                                    </div>
                                    <div className="md:col-span-1">
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">ID Proof Status</p>
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                                            <ShieldCheck size={10} /> Verified
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* 2. Property & Unit */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 className="text-[var(--color-primary)]" size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">2. Property & Unit Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6 bg-[var(--bg-card)] p-6 rounded-3xl border border-white/5">
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Property Name</p>
                                        <p className="text-sm font-bold text-white">{selectedLease.propertyId?.propertyName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Unit Number</p>
                                        <p className="text-sm font-bold text-white">#{selectedLease.unitId?.unitNumber || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Floor Level</p>
                                        <p className="text-sm font-bold text-white">{selectedLease.floorId?.name || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Full Address</p>
                                        <p className="text-xs font-medium text-white/70 leading-relaxed">{selectedLease.propertyId?.address || "Available on property profile"}</p>
                                    </div>
                                </div>
                            </section>

                            {/* 3. Lease Details */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="text-[var(--color-primary)]" size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">3. Lease Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6 bg-[var(--bg-card)] p-6 rounded-3xl border border-white/5">
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Start Date</p>
                                        <p className="text-sm font-bold text-white">{formatDate(selectedLease.leaseStart)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">End Date</p>
                                        <p className="text-sm font-bold text-white">{formatDate(selectedLease.leaseEnd)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Contract Duration</p>
                                        <p className="text-sm font-bold text-white">{calculateDuration(selectedLease.leaseStart, selectedLease.leaseEnd)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Agreement Type</p>
                                        <p className="text-sm font-black text-[var(--color-primary)] uppercase tracking-wider">Fixed Term</p>
                                    </div>
                                </div>
                            </section>

                            {/* 4. Financial Details */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <IndianRupee className="text-[var(--color-primary)]" size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">4. Financial Details</h3>
                                </div>
                                <div className="bg-[var(--bg-card)] rounded-3xl border border-white/5 overflow-hidden">
                                    <div className="p-6 border-b border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[9px] font-bold text-[var(--text-card)] uppercase tracking-widest">Monthly Rent Amount</p>
                                            <p className="text-lg font-black text-white">{formatCurrency(selectedLease.rent)}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 p-6 gap-6">
                                        <div>
                                            <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Security Deposit</p>
                                            <p className="text-sm font-bold text-white">{formatCurrency(selectedLease.deposit)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Maintenance Cost</p>
                                            <p className="text-sm font-bold text-white">{formatCurrency(selectedLease.maintenanceCost)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Utility Charges</p>
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">Inclusive / Metered</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Late Fee Assignment</p>
                                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{formatCurrency(selectedLease.lateFees || 100)} / Day Delay</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Payment Rules */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="text-[var(--color-primary)]" size={16} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">5. Payment Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-6 bg-[var(--bg-card)] p-6 rounded-3xl border border-white/5">
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Rent Due Cycle</p>
                                        <p className="text-xs font-bold text-white">Before 5th of Month</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-card)] uppercase mb-1">Primary Method</p>
                                        <p className="text-xs font-bold text-white">Online Portal / UPI</p>
                                    </div>
                                    <div className="col-span-2 p-4 bg-white/5 rounded-2xl flex gap-3">
                                        <Info size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-medium text-[var(--text-card)] leading-relaxed italic">Payment must be completed digitally through the integrated portal or via direct bank transfer as mentioned in individual invoices.</p>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--color-primary);
                }
            `}</style>
        </div>
    );
}
