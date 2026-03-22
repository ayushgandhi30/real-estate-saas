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
    Info,
    Download,
    Mail,
    Smartphone,
    MoreVertical
} from "lucide-react";
import { useAuth } from "../store/auth";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Button from "../components/ui/Button";

export default function LeaseAgrement() {
    const { token } = useAuth();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedLease, setSelectedLease] = useState(null);

    const handleDownload = (tenant) => {
        const doc = new jsPDF();
        const primaryColor = [231, 76, 60]; // Red theme matching overall app

        // --- Header Section ---
        doc.setFillColor(28, 40, 52); // Brand Secondary 
        doc.rect(0, 0, 210, 40, "F");

        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("LEASE AGREEMENT", 105, 25, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(200);
        doc.setFont("helvetica", "normal");
        doc.text(`System Generated on: ${new Date().toLocaleDateString("en-IN")}`, 105, 32, { align: "center" });

        // --- Tenant & Property Details Table ---
        autoTable(doc, {
            startY: 50,
            head: [[{ content: "AGREEMENT PARAMETERS", colSpan: 2, styles: { halign: "center", fillWidth: true } }]],
            body: [
                ["Legal Name", tenant.userId?.name || tenant.name],
                ["Auth Identifier", tenant.userId?.email || tenant.email || "N/A"],
                ["Contact Record", tenant.userId?.phone || tenant.phone || "N/A"],
                ["Asset Name", tenant.propertyId?.propertyName || "N/A"],
                ["Unit / Floor", `Unit ${tenant.unitId?.unitNumber || "N/A"} • ${tenant.floorId?.name || "N/A"}`],
                ["Commencement", formatDate(tenant.leaseStart)],
                ["Termination", formatDate(tenant.leaseEnd)],
                ["Effective Term", calculateDuration(tenant.leaseStart, tenant.leaseEnd)],
            ],
            theme: "grid",
            headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: "bold" },
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: { 0: { fontStyle: "bold", fillColor: [250, 250, 250], width: 60 } },
        });

        // --- Financial Information Table ---
        const finalY = doc.lastAutoTable.finalY + 10;
        autoTable(doc, {
            startY: finalY,
            head: [[{ content: "ECONOMIC SETTLEMENT", colSpan: 2, styles: { halign: "center" } }]],
            body: [
                ["Monthly Lease Yield", `INR ${tenant.rent}`],
                ["Security Reserve", `INR ${tenant.deposit}`],
                ["Facility Maintenance", `INR ${tenant.maintenanceCost}`],
                ["Utility Allocation", "Variable (Metered)"],
                ["Delinquency Surcharge", `INR ${tenant.lateFees || 100} per diem`],
            ],
            theme: "grid",
            headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: { 0: { fontStyle: "bold", fillColor: [250, 250, 250], width: 60 } },
        });

        const footerY = doc.lastAutoTable.finalY + 30;
        doc.setDrawColor(230);
        doc.line(20, footerY, 80, footerY);
        doc.line(130, footerY, 190, footerY);

        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Portfolio Manager (Authorized)", 50, footerY + 5, { align: "center" });
        doc.text("Resident (Counter-Sign)", 160, footerY + 5, { align: "center" });

        doc.save(`Agreement_Manifest_${tenant.userId?.name || tenant.name}.pdf`);
    };

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
                <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

            {/* Header Section */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="font-black text-[var(--color-secondary)] tracking-tight">
                        Lease Management
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--color-primary)] transition-all" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, property or unit..."
                            className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-[13px] font-bold text-[var(--color-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                        {["All", "Active", "Expiring"].map((status) => (
                            <Button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                variant={filterStatus === status ? "primary" : "ghost"}
                                size="sm"
                                className={`px-5 tracking-widest font-black uppercase ${filterStatus === status ? "bg-gray-900 text-white scale-105" : ""}`}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Table Area */}
            <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">tenant name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Property </th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">lease date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tenant Rent</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant._id} className="hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-[var(--color-primary)]">
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center text-xs font-black text-[var(--color-secondary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-sm">
                                                {(tenant.userId?.name || tenant.name || 'U')[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-[var(--color-secondary)] truncate max-w-[180px]">{tenant.userId?.name || tenant.name}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-bold truncate max-w-[180px] opacity-60">ID: #{tenant._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="space-y-0.5">
                                            <p className="text-[13px] font-bold text-[var(--color-secondary)]">{tenant.propertyId?.propertyName}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60">U-{tenant.unitId?.unitNumber} • {tenant.floorId?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <p className="text-[12px] font-bold text-[var(--color-secondary)]">{formatDate(tenant.leaseStart)}</p>
                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1 opacity-40">Until {formatDate(tenant.leaseEnd)}</p>
                                    </td>
                                    <td className="px-8 py-7">
                                        <span className="text-lg font-black text-[var(--color-secondary)]">{formatCurrency(tenant.rent)}</span>
                                        <span className="block text-[9px] font-bold text-[var(--text-muted)] uppercase opacity-40">Monthly Net</span>
                                    </td>
                                    <td className="px-8 py-7">
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${tenant.leaseStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${tenant.leaseStatus === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            {tenant.leaseStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                onClick={() => setSelectedLease(tenant)}
                                                variant="secondary"
                                                size="xs"
                                                iconOnly
                                                icon={<Eye size={18} />}
                                            />
                                            <Button
                                                onClick={() => handleDownload(tenant)}
                                                variant="secondary"
                                                size="xs"
                                                iconOnly
                                                icon={<Download size={18} />}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Detailed View Modal */}
            {selectedLease && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setSelectedLease(null)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight">Lease Details</h2>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-1">
                                        Contract ID: #{selectedLease._id.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setSelectedLease(null)}
                                iconOnly
                                variant="secondary"
                                size="xs"
                                icon={<X size={18} />}
                                className="hover:bg-gray-100"
                            />
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">

                            {/* Tenant Information */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <User size={14} className="text-indigo-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Tenant Information</h4>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                    <div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Full Name</p>
                                        <p className="text-lg font-black text-[var(--color-secondary)]">{selectedLease.userId?.name || selectedLease.name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Email</p>
                                            <p className="text-xs font-bold text-[var(--color-secondary)] truncate">{selectedLease.userId?.email || selectedLease.email || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Phone</p>
                                            <p className="text-xs font-bold text-[var(--color-secondary)]">{selectedLease.userId?.phone || selectedLease.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Property Details */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Building2 size={14} className="text-indigo-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Property Details</h4>
                                </div>
                                <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                                    <div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Property Name</p>
                                        <p className="text-sm font-black text-[var(--color-secondary)]">{selectedLease.propertyId?.propertyName}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Unit Number</p>
                                            <p className="text-xs font-black text-[var(--color-secondary)]">#{selectedLease.unitId?.unitNumber || "N/A"}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl">
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Floor</p>
                                            <p className="text-xs font-black text-[var(--color-secondary)]">{selectedLease.floorId?.name || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Financial Terms */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <IndianRupee size={14} className="text-indigo-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Financial Terms</h4>
                                </div>
                                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="p-6 bg-emerald-50/50">
                                        <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-1">Monthly Rent</p>
                                        <p className="text-3xl font-black text-emerald-900 tracking-tighter">{formatCurrency(selectedLease.rent)}</p>
                                    </div>
                                    <div className="grid grid-cols-2 p-6 gap-6">
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Security Deposit</p>
                                            <p className="text-sm font-black text-[var(--color-secondary)]">{formatCurrency(selectedLease.deposit)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Maintenance</p>
                                            <p className="text-sm font-black text-[var(--color-secondary)]">{formatCurrency(selectedLease.maintenanceCost)}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Lease Schedule */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Calendar size={14} className="text-indigo-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Lease Schedule</h4>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Start Date</p>
                                        <p className="text-sm font-black text-[var(--color-secondary)]">{formatDate(selectedLease.leaseStart)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">End Date</p>
                                        <p className="text-sm font-black text-[var(--color-secondary)]">{formatDate(selectedLease.leaseEnd)}</p>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-indigo-600" />
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Duration</p>
                                        </div>
                                        <p className="text-sm font-black text-[var(--color-secondary)] uppercase">{calculateDuration(selectedLease.leaseStart, selectedLease.leaseEnd)}</p>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Footer Status */}
                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm bg-white ${selectedLease.leaseStatus === 'Active' ? 'text-emerald-600 border-emerald-100' : 'text-amber-600 border-amber-100'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${selectedLease.leaseStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                {selectedLease.leaseStatus}
                            </span>
                            <Button
                                onClick={() => handleDownload(selectedLease)}
                                variant="primary"
                                size="sm"
                                icon={<Download size={14} />}
                            >
                                Download
                            </Button>
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
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--color-primary);
                }
            `}</style>
        </div>
    );
}
