import React, { useEffect, useState } from "react";
import {
    FileText,
    Home,
    CreditCard,
    IndianRupee,
    ClipboardList,
    Loader2,
    AlertCircle,
    Download,
    Calendar,
    ShieldCheck,
    Info,
    ArrowRight
} from "lucide-react";
import { useAuth } from "../store/auth";
import { BASE_URL } from "../store/api";
import Button from "../components/ui/Button";

export default function Lease() {
    const { token } = useAuth();
    const [leaseData, setLeaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaseData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/tenant/getmy-lease`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLeaseData(data.lease);
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to fetch lease data");
            }
        } catch (err) {
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchLeaseData();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="animate-spin text-[var(--color-primary)]" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Synchronizing Lease Records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--bg-main)] p-6">
                <div className="bg-white border border-rose-100 rounded-[3rem] p-12 max-w-md w-full text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-8">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-[var(--color-secondary)] mb-4 tracking-tight">Access Restricted</h2>
                    <p className="text-[var(--text-muted)] font-medium mb-10 leading-relaxed">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="primary"
                        size="md"
                        className="w-full tracking-widest font-black uppercase"
                    >
                        Retry Authorization
                    </Button>
                </div>
            </div>
        );
    }

    if (!leaseData) return null;

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
        }).format(amount);
    };

    const calculateDuration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffInMs = endDate - startDate;
        const diffInMonths = Math.round(diffInMs / (1000 * 60 * 60 * 24 * 30.44));
        return `${diffInMonths} Months`;
    };

    const rules = [
        "Rent must be paid before the 5th of each month",
        "No subleasing allowed without explicit permission",
        "Maintenance issues must be reported through the portal",
        "Adherence to community guidelines is mandatory",
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

            {/* Page Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[var(--color-secondary)] tracking-tight">
                        Lease Intelligence
                    </h1>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    icon={<Download size={16} />}
                    className="bg-gray-900 tracking-widest font-black uppercase hover:bg-black"
                >
                    Download
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Core Identification */}
                <div className="premium-card p-10 rounded-[3rem] bg-white border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                        <FileText size={180} />
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight uppercase tracking-wider">Lease Details</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Lease ID</p>
                            <p className="text-xl font-black text-[var(--color-secondary)] tracking-tight">LSE-{leaseData._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</p>
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${leaseData.leaseStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${leaseData.leaseStatus === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                {leaseData.leaseStatus}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Lease End Date</p>
                            <p className="text-sm font-bold text-[var(--color-secondary)]">{formatDate(leaseData.leaseEnd)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Tenure</p>
                            <p className="text-sm font-bold text-[var(--color-secondary)]">{calculateDuration(leaseData.leaseStart, leaseData.leaseEnd)}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Physical Asset Data */}
                <div className="premium-card p-10 rounded-[3rem] bg-white border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                        <Home size={180} />
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-3xl">
                            <Home size={24} />
                        </div>
                        <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight uppercase tracking-wider">Property Details</h2>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Property Name</p>
                            <p className="text-xl font-black text-[var(--color-secondary)] tracking-tight">{leaseData.propertyId?.propertyName || "Corporate Asset"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Unit Number</p>
                                <p className="text-sm font-black text-[var(--color-secondary)]">Suite {leaseData.unitId?.unitNumber || "N/A"}</p>
                            </div>
                            <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Floor</p>
                                <p className="text-sm font-black text-[var(--color-secondary)]">{leaseData.floorId?.name || "N/A"}</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Property Address</p>
                            <p className="text-xs font-medium text-[var(--text-muted)]/80 leading-relaxed max-w-sm">{leaseData.propertyId?.address || "Registered Address Data Not Available"}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Economic Constraints */}
                <div className="premium-card p-10 rounded-[3rem] bg-white border border-gray-100 relative overflow-hidden group lg:col-span-2">
                    <div className="absolute bottom-0 right-0 p-10 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                        <IndianRupee size={240} />
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
                            <IndianRupee size={24} />
                        </div>
                        <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight uppercase tracking-wider">Financial Terms</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-2 p-6 bg-emerald-50/30 rounded-[2.5rem] border border-emerald-50">
                            <p className="text-[12px] font-black text-emerald-700/60 uppercase tracking-widest">Monthly Rent</p>
                            <p className="text-3xl font-black text-emerald-700">{formatCurrency(leaseData.rent)}</p>
                        </div>
                        <div className="space-y-2 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Security Deposit</p>
                            <p className="text-2xl font-black text-[var(--color-secondary)]">{formatCurrency(leaseData.deposit)}</p>
                        </div>
                        <div className="space-y-2 p-6 bg-amber-50/40 rounded-[2.5rem] border border-amber-50">
                            <p className="text-[12px] font-black text-amber-700/60 uppercase tracking-widest">Payment Cycle</p>
                            <p className="text-xl font-black text-amber-900 leading-tight">Net 5 of Month</p>
                        </div>
                        <div className="space-y-2 p-6 bg-rose-50/40 rounded-[2.5rem] border border-rose-50">
                            <p className="text-[12px] font-black text-rose-700/60 uppercase tracking-widest">Late Fee</p>
                            <p className="text-xl font-black text-rose-900">{formatCurrency(leaseData.lateFees || 100)} / Diem</p>
                        </div>
                    </div>

                    <div className="mt-5 pt-10 border-t border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Paid</p>
                            <p className="text-lg font-black text-[var(--color-secondary)] opacity-40">{formatCurrency(leaseData.totalCollected || 0)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Due</p>
                            <p className="text-lg font-black text-rose-600">{formatCurrency(leaseData.pending || 0)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest">Maintenance Cost</p>
                            <p className="text-lg font-black text-[var(--color-secondary)] opacity-40">{formatCurrency(leaseData.maintenanceCost || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Clauses & Rules */}
            <section className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] p-10 lg:p-12">
                <div className="flex items-center gap-4 mb-0">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-3xl">
                        <ClipboardList size={24} />
                    </div>
                    <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight uppercase tracking-wider">Lease Rules</h2>
                </div>

                <div className="grid lg:grid-cols-5 gap-12 lg:items-center">
                    <div className="lg:col-span-3">
                        <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                            {rules.map((rule, i) => (
                                <li key={i} className="flex gap-4 group">
                                    <div className="mt-1 w-5 h-5 rounded-lg bg-gray-50 flex items-center justify-center text-[var(--color-primary)] font-black text-[10px] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm font-medium text-[var(--text-muted)]/80 leading-relaxed group-hover:text-[var(--color-secondary)] transition-colors">{rule}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 text-[var(--color-primary)] opacity-[0.05]">
                            <Info size={120} />
                        </div>
                        <p className="text-sm text-[var(--text-muted)] italic font-medium leading-relaxed mb-6 relative z-10">
                            "By occupying the premises, the resident acknowledges and confirms adherence to all regulatory frameworks mentioned in the digital lease corpus."
                        </p>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-[var(--color-secondary)] text-sm shadow-sm border border-gray-100">
                                AM
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-[var(--color-secondary)]">Asset Management Division</p>
                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Verified Authority</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
