import React, { useState, useEffect } from "react";
import {
    FileText,
    Plus,
    Search,
    Download,
    Eye,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Receipt,
    ChevronDown,
    Calendar,
    Home,
    User,
    Banknote,
    Zap,
    Wrench,
    Tag,
    Loader2,
    Trash,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../store/auth";
import { useToast } from "../store/ToastContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Invoice = () => {
    const { user, token } = useAuth();
    const { toast } = useToast();

    const role = user?.role === "MANAGER" ? "manager" : "tenant";

    const [showCreate, setShowCreate] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [tenants, setTenants] = useState([]);

    // Helper to get default month and due date
    const getDefaultMonth = () => {
        return new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
    };

    const getDefaultDueDate = () => {
        const d = new Date();
        d.setDate(5);
        return d.toISOString().split("T")[0];
    };

    // Form state for creating invoice
    const initialFormData = {
        tenantId: "",
        month: getDefaultMonth(),
        rent: "",
        utilityCharges: "",
        maintenanceCharges: "",
        lateFee: "0",
        dueDate: getDefaultDueDate(),
        notes: "",
    };
    const [formData, setFormData] = useState(initialFormData);

    // ── Handle tenant change (auto-fill) ───────────
    const handleTenantChange = (tenantId) => {
        const tenant = tenants.find((t) => (t.userId?._id || t._id) === tenantId);
        if (tenant) {
            setFormData((prev) => ({
                ...prev,
                tenantId,
                rent: tenant.rent || "",
                maintenanceCharges: tenant.maintenanceCost || "",
                lateFee: tenant.lateFees || 0,
            }));
        } else {
            setFormData((prev) => ({ ...prev, tenantId }));
        }
    };

    // ── Fetch invoices ─────────────────────────────
    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:7000/api/invoice/invoices", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setInvoices(data.invoices || []);
            } else {
                console.error("Failed to fetch invoices");
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch tenants for dropdown ─────────────────
    const fetchTenants = async () => {
        try {
            const response = await fetch("http://localhost:7000/api/tenant/tenants", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setTenants(data.tenants || []);
            }
        } catch (error) {
            console.error("Error fetching tenants:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchInvoices();
            if (role === "manager") {
                fetchTenants();
            }
        }
    }, [token]);

    // ── Handle form submission ─────────────────────
    const handleSubmit = async (e) => {
        e?.preventDefault();

        if (!formData.tenantId || !formData.month || !formData.rent || !formData.dueDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch("http://localhost:7000/api/invoice/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tenantId: formData.tenantId,
                    month: formData.month,
                    rent: Number(formData.rent),
                    utilityCharges: Number(formData.utilityCharges) || 0,
                    maintenanceCharges: Number(formData.maintenanceCharges) || 0,
                    lateFee: Number(formData.lateFee) || 0,
                    dueDate: formData.dueDate,
                    notes: formData.notes,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Invoice created successfully");
                setShowCreate(false);
                setFormData(initialFormData);
                fetchInvoices();
            } else {
                toast.error(data.message || "Failed to create invoice");
            }
        } catch (error) {
            toast.error("Something went wrong while creating the invoice");
            console.error("Error creating invoice:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:7000/api/invoice/invoice/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                toast.success("Invoice deleted successfully");
                fetchInvoices();
            } else {
                toast.error("Failed to delete invoice");
            }
        } catch (error) {
            toast.error("Something went wrong while deleting the invoice");
        }
    };

    const handlePay = async (id) => {
        try {
            const response = await fetch(`http://localhost:7000/api/invoice/pay/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success("Invoice paid successfully");
                fetchInvoices();
            } else {
                toast.error("Failed to pay invoice");
            }
        } catch (error) {
            toast.error("Something went wrong while paying the invoice");
            console.error("Error paying invoice:", error);
        }
    };

    const downloadInvoicePDF = (inv) => {
        const doc = new jsPDF();
        const tenantName = getTenantName(inv);
        const unitNumber = getUnitNumber(inv);
        const total = getTotal(inv);

        // Header
        doc.setFillColor(30, 41, 59); // Dark slate
        doc.rect(0, 0, 210, 40, "F");

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(inv.invoiceNumber || "PROVISIONAL INVOICE", 105, 30, { align: "center" });

        let currentY = 55;

        // Section Helper
        const drawSectionHeader = (title, y) => {
            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "bold");
            doc.text(title.toUpperCase(), 20, y);
            doc.setDrawColor(226, 232, 240);
            doc.line(20, y + 2, 190, y + 2);
            return y + 10;
        };

        // 1. Details
        currentY = drawSectionHeader("Invoice Details", currentY);
        autoTable(doc, {
            startY: currentY,
            body: [
                ["Tenant Name", tenantName],
                ["Property", inv.propertyId?.propertyName || "N/A"],
                ["Unit / Floor", `${unitNumber} / ${inv.unitId?.floorId?.name || "N/A"}`],
                ["Billing Month", inv.month],
                ["Due Date", formatDate(inv.dueDate)],
                ["Status", inv.status],
            ],
            theme: "plain",
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: "bold", width: 50 } },
            margin: { left: 20 },
        });

        // 2. Charges Breakdown
        currentY = doc.lastAutoTable.finalY + 15;
        currentY = drawSectionHeader("Charges Breakdown", currentY);
        autoTable(doc, {
            startY: currentY,
            head: [["Description", "Amount (INR)"]],
            body: [
                ["Monthly Rent", `INR ${inv.rent?.toLocaleString()}`],
                ["Maintenance Charges", `INR ${inv.maintenanceCharges?.toLocaleString()}`],
                ["Utility Charges", `INR ${inv.utilityCharges?.toLocaleString()}`],
                ["Late Fee", `INR ${inv.lateFee?.toLocaleString()}`],
            ],
            foot: [["Total Payable", `INR ${total?.toLocaleString()}`]],
            theme: "striped",
            headStyles: { fillColor: [30, 41, 59], textColor: 255 },
            footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: "bold" },
            styles: { fontSize: 10, cellPadding: 4 },
            margin: { left: 20 },
        });

        // Notes
        if (inv.notes) {
            currentY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Notes:", 20, currentY);
            doc.setFont("helvetica", "normal");
            doc.text(inv.notes, 20, currentY + 5);
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
            doc.text(`Generated on ${new Date().toLocaleString()} | Real Estate SaaS`, 105, 290, { align: "center" });
        }

        doc.save(`${inv.invoiceNumber || "Invoice"}_${tenantName.replace(/\s+/g, "_")}.pdf`);
        toast.success("Invoice downloaded successfully");
    };
    const paidCount = invoices.filter((i) => i.status === "Paid").length;
    const unpaidCount = invoices.filter((i) => i.status === "Unpaid").length;
    const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

    const summaryCards = [
        {
            label: "Total Invoices",
            value: invoices.length,
            icon: Receipt,
            color: "from-blue-500/20 to-blue-600/5",
            iconColor: "text-blue-400",
            borderColor: "border-blue-500/20",
        },
        {
            label: "Paid",
            value: paidCount,
            icon: CheckCircle2,
            color: "from-emerald-500/20 to-emerald-600/5",
            iconColor: "text-emerald-400",
            borderColor: "border-emerald-500/20",
        },
        {
            label: "Unpaid",
            value: unpaidCount,
            icon: Clock,
            color: "from-amber-500/20 to-amber-600/5",
            iconColor: "text-amber-400",
            borderColor: "border-amber-500/20",
        },
        {
            label: "Overdue",
            value: overdueCount,
            icon: AlertCircle,
            color: "from-red-500/20 to-red-600/5",
            iconColor: "text-red-400",
            borderColor: "border-red-500/20",
        },
    ];

    // ── Format date helper ─────────────────────────
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    // ── Get display values from populated invoice ──
    const getTenantName = (inv) => inv.tenantId?.name || "Unknown";
    const getUnitNumber = (inv) => inv.unitId?.unitNumber || "—";
    const getTotal = (inv) =>
        inv.totalAmount ||
        (inv.rent || 0) + (inv.utilityCharges || 0) + (inv.maintenanceCharges || 0) + (inv.lateFee || 0);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-2">

            {/* ── HEADER ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div>
                        <h1
                            className="text-2xl font-bold text-white"
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            Invoice Management
                        </h1>
                    </div>
                </div>

                {role === "manager" && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[#0091e6] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.97] self-start sm:self-auto"
                    >
                        <Plus size={17} />
                        Create Invoice
                    </button>
                )}
            </div>

            {/* ── SUMMARY CARDS ──────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {summaryCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={i}
                            className={`relative overflow-hidden bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-2xl p-4 sm:p-5`}
                        >
                            {/* Glow blob */}
                            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20 blur-2xl bg-current" />
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-[var(--text-card)] font-medium mb-2">
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`p-2.5 rounded-xl bg-white/5 ${card.iconColor}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── FILTERS ────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 sm:max-w-sm">
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-card)]"
                    />
                    <input
                        placeholder="Search tenant or invoice…"
                        className="w-full bg-[var(--color-card)] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-secondary)] placeholder-[var(--text-card)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-colors"
                    />
                </div>

                <div className="relative">
                    <select className="appearance-none bg-[var(--color-card)] border border-white/10 rounded-xl pl-4 pr-9 py-2.5 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-colors cursor-pointer w-full sm:w-auto">
                        <option value="">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                    <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-card)] pointer-events-none"
                    />
                </div>
            </div>

            {/* ── LOADING STATE ─────────────────────────── */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                </div>
            )}

            {/* ── EMPTY STATE ──────────────────────────── */}
            {!loading && invoices.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Receipt size={48} className="text-white/10 mb-4" />
                    <p className="text-[var(--text-card)] text-sm">No invoices found.</p>
                    {role === "manager" && (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[#0091e6] text-white font-semibold text-sm transition-all"
                        >
                            <Plus size={17} />
                            Create your first invoice
                        </button>
                    )}
                </div>
            )}

            {/* ── TABLE (desktop) / CARDS (mobile) ───────── */}
            {!loading && invoices.length > 0 && (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-[var(--color-card)] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {["Invoice", "Tenant", "Unit", "Month", "Rent", "Utility", "Total", "Due Date", "Status", "Actions"].map((h) => (
                                            <th
                                                key={h}
                                                className="px-5 py-4 text-left text-xs font-semibold text-[var(--text-card)] uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/5">
                                    {invoices.map((inv, index) => {
                                        const total = getTotal(inv);
                                        const isPaid = inv.status === "Paid";
                                        const tenantName = getTenantName(inv);

                                        return (
                                            <tr
                                                key={inv._id || index}
                                                className="group hover:bg-white/[0.03] transition-colors duration-150"
                                            >
                                                <td className="px-5 py-4">
                                                    <span className="font-mono text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg">
                                                        {`INV-${String(index + 1).padStart(3, "0")}`}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-sm font-medium text-white">
                                                            {tenantName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-[var(--text-card)]">
                                                    {getUnitNumber(inv)}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                                                    {inv.month}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                                                    ₹{(inv.rent || 0).toLocaleString()}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-[var(--text-card)]">
                                                    ₹{(inv.utilityCharges || 0).toLocaleString()}
                                                </td>
                                                <td className="px-5 py-4 text-sm font-bold text-white">
                                                    ₹{total.toLocaleString()}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-[var(--text-card)] whitespace-nowrap">
                                                    {formatDate(inv.dueDate)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isPaid
                                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                            }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-400" : "bg-amber-400"}`} />
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setSelectedInvoice(inv)}
                                                            title="View"
                                                            className="p-2 rounded-lg text-[var(--text-card)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all duration-150"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => downloadInvoicePDF(inv)}
                                                            title="Download"
                                                            className="p-2 rounded-lg text-[var(--text-card)] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-150"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        {role === "manager" && (
                                                            <button
                                                                title="Delete"
                                                                onClick={() => handleDelete(inv._id)}
                                                                className="p-2 rounded-lg text-[var(--text-card)] hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-150"
                                                            >
                                                                <Trash size={16} />
                                                            </button>
                                                        )}
                                                        {role === "tenant" && !isPaid && (
                                                            <button
                                                                title="Pay"
                                                                onClick={() => handlePay(inv._id)}
                                                                className="p-2 rounded-lg text-[var(--text-card)] hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-150"
                                                            >
                                                                <CreditCard size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Invoice Cards */}
                    <div className="md:hidden flex flex-col gap-4 p-1">
                        {invoices.map((inv, index) => {
                            const total = getTotal(inv);
                            const isPaid = inv.status === "Paid";
                            const tenantName = getTenantName(inv);

                            return (
                                <div
                                    key={inv._id || index}
                                    className="bg-[var(--color-card)]/40 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-sm hover:bg-white/[0.03] transition-all"
                                >
                                    {/* Card Top */}
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                {tenantName[0]}
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-white tracking-tight">{tenantName}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-card)] font-black uppercase tracking-widest mt-0.5">
                                                    <Home size={10} /> unit {getUnitNumber(inv)}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPaid
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
                                            {inv.status}
                                        </span>
                                    </div>

                                    {/* Card Info Bar */}
                                    <div className="flex items-center justify-between mb-5 bg-white/5 p-3 rounded-2xl">
                                        <span className="font-mono text-[10px] font-black text-[var(--color-primary)] tracking-wider">
                                            {inv.invoiceNumber || `INV-${String(index + 1).padStart(3, "0")}`}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-card)] uppercase">
                                            <Calendar size={12} className="text-[var(--color-primary)]" />
                                            {inv.month}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">Rent</span>
                                            <p className="text-sm font-bold text-white">₹{(inv.rent || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">Utility</span>
                                            <p className="text-sm font-bold text-white">₹{(inv.utilityCharges || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">Due Date</span>
                                            <p className="text-sm font-bold text-[var(--text-secondary)]">{formatDate(inv.dueDate)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">Total</span>
                                            <p className="text-lg font-black text-white">₹{total.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Card Actions */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => setSelectedInvoice(inv)}
                                            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 hover:bg-[var(--color-primary)]/10 text-[var(--text-card)] hover:text-white transition-all text-xs font-bold border border-white/5"
                                        >
                                            <Eye size={14} /> View Details
                                        </button>
                                        <button
                                            onClick={() => downloadInvoicePDF(inv)}
                                            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] transition-all text-xs font-bold border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/5"
                                        >
                                            <Download size={14} /> Get PDF
                                        </button>
                                        {role === "tenant" && !isPaid && (
                                            <button 
                                                onClick={() => handlePay(inv._id)}
                                                className="col-span-2 flex items-center justify-center gap-2 py-3 mt-1 rounded-2xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 text-violet-400 transition-all text-xs font-black uppercase tracking-widest border border-violet-500/30"
                                            >
                                                <CreditCard size={14} /> Pay Balance
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── CREATE INVOICE MODAL ───────────────────── */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                                    <Plus size={18} className="text-[var(--color-primary)]" />
                                </div>
                                <h2 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                                    Create Invoice
                                </h2>
                            </div>
                            <button
                                onClick={() => { setShowCreate(false); setFormData(initialFormData); }}
                                className="p-2 rounded-lg text-[var(--text-card)] hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Tenant Select */}
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                                        Tenant *
                                    </label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-card)]" />
                                        <select
                                            required
                                            value={formData.tenantId}
                                            onChange={(e) => handleTenantChange(e.target.value)}
                                            className="w-full bg-[var(--bg-main)] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-colors appearance-none"
                                        >
                                            <option value="">Select Tenant</option>
                                            {tenants.map((t) => (
                                                <option key={t._id} value={t.userId?._id || t._id}>
                                                    {t.userId?.name || t.name} — Unit {t.unitId?.unitNumber || "N/A"}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-card)] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Month */}
                                <Input
                                    label="Month *"
                                    required
                                    placeholder="e.g. Mar 2026"
                                    value={formData.month}
                                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                    className="bg-[var(--bg-main)]!"
                                />

                                {/* Rent */}
                                <Input
                                    label="Rent (₹) *"
                                    type="number"
                                    required
                                    placeholder="15000"
                                    value={formData.rent}
                                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                                    className="bg-[var(--bg-main)]!"
                                />

                                {/* Utility Charges */}
                                <Input
                                    label="Utility Charges (₹)"
                                    type="number"
                                    placeholder="800"
                                    value={formData.utilityCharges}
                                    onChange={(e) => setFormData({ ...formData, utilityCharges: e.target.value })}
                                    className="bg-[var(--bg-main)]!"
                                />

                                {/* Maintenance Charges */}
                                <Input
                                    label="Maintenance (₹)"
                                    type="number"
                                    placeholder="1000"
                                    value={formData.maintenanceCharges}
                                    onChange={(e) => setFormData({ ...formData, maintenanceCharges: e.target.value })}
                                    className="bg-[var(--bg-main)]!"
                                />

                                {/* Late Fee */}
                                <Input
                                    label="Late Fee (₹)"
                                    type="number"
                                    placeholder="0"
                                    value={formData.lateFee}
                                    onChange={(e) => setFormData({ ...formData, lateFee: e.target.value })}
                                    className="bg-[var(--bg-main)]!"
                                />

                                {/* Due Date */}
                                <Input
                                    label="Due Date *"
                                    type="date"
                                    required
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="bg-[var(--bg-main)]!"
                                />

                                {/* Notes */}
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)]">
                                        Notes
                                    </label>
                                    <textarea
                                        placeholder="Optional notes..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={2}
                                        className="w-full bg-[var(--bg-main)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] placeholder-[var(--text-card)] focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/30 transition-colors resize-none"
                                    />
                                </div>

                                {/* Total Preview */}
                                <div className="sm:col-span-2 pt-2">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
                                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                            <Banknote size={16} className="text-[var(--color-primary)]" />
                                            <span className="text-sm font-semibold">Total Amount</span>
                                        </div>
                                        <span className="text-xl font-bold text-[var(--color-primary)]">
                                            ₹{((Number(formData.rent) || 0) +
                                                (Number(formData.utilityCharges) || 0) +
                                                (Number(formData.maintenanceCharges) || 0) +
                                                (Number(formData.lateFee) || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreate(false); setFormData(initialFormData); }}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-card)] hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    Cancel
                                </button>
                                <Button
                                    htmlType="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[#0091e6] transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.97]"
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving…
                                        </span>
                                    ) : (
                                        "Save Invoice"
                                    )}
                                </Button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {/* ── INVOICE DETAILS MODAL ─────────────────── */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--color-card)] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                                    <Receipt size={18} className="text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                                        Invoice Details
                                    </h2>
                                    <p className="text-xs text-[var(--text-card)] font-mono">
                                        {selectedInvoice.invoiceNumber || "—"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-2 rounded-lg text-[var(--text-card)] hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tenant Info */}
                        <div className="px-6 py-5">
                            <div className="flex items-center gap-3 mb-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                                    {getTenantName(selectedInvoice)[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{getTenantName(selectedInvoice)}</p>
                                    <p className="text-xs text-[var(--text-card)]">
                                        Unit {getUnitNumber(selectedInvoice)} · {selectedInvoice.month}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${selectedInvoice.status === "Paid"
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedInvoice.status === "Paid" ? "bg-emerald-400" : "bg-amber-400"}`} />
                                        {selectedInvoice.status}
                                    </span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2.5 mb-4">
                                {[
                                    { label: "Rent", value: selectedInvoice.rent || 0, icon: Home },
                                    { label: "Utility", value: selectedInvoice.utilityCharges || 0, icon: Zap },
                                    { label: "Maintenance", value: selectedInvoice.maintenanceCharges || 0, icon: Wrench },
                                    { label: "Late Fee", value: selectedInvoice.lateFee || 0, icon: Tag },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-white/[0.03]">
                                        <div className="flex items-center gap-2.5 text-sm text-[var(--text-card)]">
                                            <Icon size={14} />
                                            {label}
                                        </div>
                                        <span className="text-sm font-medium text-[var(--text-secondary)]">
                                            ₹{value.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between py-3 px-3.5 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-4">
                                <span className="text-sm font-semibold text-[var(--color-primary)]">Total Amount</span>
                                <span className="text-lg font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-heading)" }}>
                                    ₹{getTotal(selectedInvoice).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-card)]">
                                <Calendar size={13} />
                                Due: {formatDate(selectedInvoice.dueDate)}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-card)] hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                            >
                                Close
                            </button>

                            <button
                                onClick={() => downloadInvoicePDF(selectedInvoice)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                            >
                                <Download size={15} />
                                Download
                            </button>

                            {role === "tenant" && (
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[#0091e6] transition-all shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.97]">
                                    <CreditCard size={15} />
                                    Pay Rent
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Invoice;