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
    IndianRupee,
    Zap,
    Wrench,
    Tag,
    Loader2,
    Trash,
    MoreVertical
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../store/auth";
import { BASE_URL } from "../store/api";
import { useToast } from "../store/ToastContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { DEMO_INVOICES } from "../utils/demoData";

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
            const response = await fetch(`${BASE_URL}/api/invoice/invoices`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                const fetchedInvoices = data.invoices || [];
                if (user?.isDemoAccount) {
                    setInvoices([...DEMO_INVOICES, ...fetchedInvoices]);
                } else {
                    setInvoices(fetchedInvoices);
                }
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
            const response = await fetch(`${BASE_URL}/api/tenant/tenants`, {
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
            const response = await fetch(`${BASE_URL}/api/invoice/`, {
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
            const response = await fetch(`${BASE_URL}/api/invoice/invoice/${id}`, {
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
            const response = await fetch(`${BASE_URL}/api/invoice/pay/${id}`, {
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
        doc.setFillColor(28, 40, 52); // Brand Secondary
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
            doc.setTextColor(28, 40, 52);
            doc.setFont("helvetica", "bold");
            doc.text(title.toUpperCase(), 20, y);
            doc.setDrawColor(240, 240, 240);
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
            head: [["Description", "Amount (₹)"]],
            body: [
                ["Monthly Rent", `₹ ${inv.rent?.toLocaleString()}`],
                ["Maintenance Charges", `₹ ${inv.maintenanceCharges?.toLocaleString()}`],
                ["Utility Charges", `₹ ${inv.utilityCharges?.toLocaleString()}`],
                ["Late Fee", `₹ ${inv.lateFee?.toLocaleString()}`],
            ],
            foot: [["Total Payable", `₹ ${total?.toLocaleString()}`]],
            theme: "striped",
            headStyles: { fillColor: [231, 76, 60], textColor: 255 },
            footStyles: { fillColor: [250, 250, 250], textColor: [28, 40, 52], fontStyle: "bold" },
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
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
            doc.text(`Generated on ${new Date().toLocaleString()} | Trevita Property Mgmt.`, 105, 290, { align: "center" });
        }

        doc.save(`${inv.invoiceNumber || "Invoice"}_${tenantName.replace(/\s+/g, "_")}.pdf`);
        toast.success("Invoice downloaded successfully");
    };

    const paidCount = invoices.filter((i) => i.status === "Paid").length;
    const unpaidCount = invoices.filter((i) => i.status === "Unpaid").length;
    const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

    const summaryCards = [
        {
            label: "Total Flow",
            value: invoices.length,
            icon: IndianRupee,
            color: "bg-blue-50/50",
            iconBg: "bg-blue-600",
            borderColor: "border-blue-100",
            textColor: "text-blue-600"
        },
        {
            label: "PAID",
            value: paidCount,
            icon: CheckCircle2,
            color: "bg-emerald-50/50",
            iconBg: "bg-emerald-600",
            borderColor: "border-emerald-100",
            textColor: "text-emerald-600"
        },
        {
            label: "Pending",
            value: unpaidCount,
            icon: Clock,
            color: "bg-amber-50/50",
            iconBg: "bg-amber-600",
            borderColor: "border-amber-100",
            textColor: "text-amber-600"
        },
        {
            label: "Overdue",
            value: overdueCount,
            icon: AlertCircle,
            color: "bg-rose-50/50",
            iconBg: "bg-rose-600",
            borderColor: "border-rose-100",
            textColor: "text-rose-600"
        },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const getTenantName = (inv) => inv.tenantId?.name || "Unknown Account";
    const getUnitNumber = (inv) => inv.unitId?.unitNumber || "N/A";
    const getTotal = (inv) =>
        inv.totalAmount ||
        (inv.rent || 0) + (inv.utilityCharges || 0) + (inv.maintenanceCharges || 0) + (inv.lateFee || 0);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-2 font-['Inter'] space-y-5">

            {/* ── HEADER ─────────────────────────────────── */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[var(--color-secondary)] tracking-tight">
                        Invoice Management
                    </h1>
                </div>

                {role === "manager" && (
                    <Button
                        onClick={() => setShowCreate(true)}
                        variant="primary"
                        size="md"
                    >
                        CREATE NEW INVOICE
                    </Button>
                )}
            </header>

            {/* ── SUMMARY CARDS ──────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={i}
                            className={`premium-card p-6 rounded-[2.5rem] relative overflow-hidden group border ${card.borderColor}`}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                                        {card.label}
                                    </p>
                                    <p className="text-3xl font-black text-[var(--color-secondary)] tracking-tighter">
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-2xl ${card.iconBg} text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] ${card.textColor} group-hover:scale-150 transition-transform duration-700`}>
                                <Icon size={80} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── FILTERS ────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 sm:max-w-md group">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors"
                    />
                    <input
                        placeholder="Search by tenant, invoice or unit..."
                        className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-[13px] font-bold text-[var(--color-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-sm"
                    />
                </div>

                <div className="relative">
                    <select className="appearance-none bg-white border border-gray-100 rounded-2xl px-6 py-3 text-[13px] font-black text-[var(--color-secondary)] uppercase tracking-wider focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all cursor-pointer shadow-sm pr-12 min-w-[160px]">
                        <option value="">Status: All</option>
                        <option value="Paid">Settled</option>
                        <option value="Unpaid">Pending</option>
                    </select>
                    <ChevronDown
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none opacity-50"
                    />
                </div>
            </div>

            {/* ── TABLE / LIST ─────────────────────────── */}
            <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Synchronizing Financials...</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6 border border-gray-100">
                            <Receipt size={40} />
                        </div>
                        <h3 className="text-xl font-black text-[var(--color-secondary)] uppercase tracking-tight">Pure Ledger</h3>
                        <p className="text-[var(--text-muted)] text-sm font-medium mt-2 max-w-xs">No invoices have been recorded in the platform yet.</p>
                        {role === "manager" && (
                            <Button
                                onClick={() => setShowCreate(true)}
                                variant="secondary"
                                size="md"
                            >
                                Generate First Invoice
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] uppercase font-black text-[var(--text-muted)] bg-gray-50/50 border-b border-gray-50">
                                    <tr>
                                        <th className="px-8 py-5 tracking-widest">Serial</th>
                                        <th className="px-8 py-5 tracking-widest">Tenant</th>
                                        <th className="px-8 py-5 tracking-widest">Invoice Month</th>
                                        <th className="px-8 py-5 tracking-widest">Rent</th>
                                        <th className="px-8 py-5 tracking-widest">Due Date</th>
                                        <th className="px-8 py-5 tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-right tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invoices.map((inv, index) => {
                                        const total = getTotal(inv);
                                        const isPaid = inv.status === "Paid";
                                        const tenantName = getTenantName(inv);

                                        return (
                                            <tr key={inv._id} className="group hover:bg-gray-50/50 transition-colors border-l-4 border-l-transparent hover:border-l-[var(--color-primary)]">
                                                <td className="px-8 py-7">
                                                    <span className="text-[11px] font-black text-[var(--text-muted)] opacity-60">
                                                        #{String(index + 1).padStart(4, "0")}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-7">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center text-xs font-black text-[var(--color-secondary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-sm">
                                                            {tenantName[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-[var(--color-secondary)] text-sm">{tenantName}</span>
                                                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase mt-0.5 opacity-60">Unit {getUnitNumber(inv)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-7 text-[13px] font-bold text-[var(--color-secondary)]">
                                                    {inv.month}
                                                </td>
                                                <td className="px-8 py-7">
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-[var(--color-secondary)]">₹{total.toLocaleString()}</span>
                                                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Gross Amount (₹)</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-7 text-[12px] font-bold text-[var(--text-muted)]">
                                                    {formatDate(inv.dueDate)}
                                                </td>
                                                <td className="px-8 py-7 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isPaid
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        : "bg-amber-50 text-amber-600 border-amber-100"
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-600" : "bg-amber-600"}`} />
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-7">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            onClick={() => setSelectedInvoice(inv)}
                                                            variant="secondary"
                                                            size="xs"
                                                            iconOnly
                                                            icon={<Eye size={16} />}
                                                            title="Inspector"
                                                        />
                                                        <Button
                                                            onClick={() => downloadInvoicePDF(inv)}
                                                            variant="secondary"
                                                            size="xs"
                                                            iconOnly
                                                            icon={<Download size={16} />}
                                                            title="Export PDF"
                                                        />
                                                        {role === "manager" && (
                                                            <Button
                                                                onClick={() => handleDelete(inv._id)}
                                                                variant="danger"
                                                                size="xs"
                                                                iconOnly
                                                                icon={<Trash size={16} />}
                                                                title="Purge Record"
                                                            />
                                                        )}
                                                        {role === "tenant" && !isPaid && (
                                                            <Button
                                                                onClick={() => handlePay(inv._id)}
                                                                variant="primary"
                                                                size="xs"
                                                                className="ml-2 font-black uppercase tracking-widest"
                                                            >
                                                                Pay Now
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Grid View */}
                        <div className="md:hidden p-4 space-y-4">
                            {invoices.map((inv, index) => {
                                const total = getTotal(inv);
                                const isPaid = inv.status === "Paid";
                                const tenantName = getTenantName(inv);

                                return (
                                    <div key={inv._id} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 space-y-5 hover:bg-white transition-all shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-lg font-black text-[var(--color-secondary)] shadow-sm">
                                                    {tenantName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[var(--color-secondary)]">{tenantName}</p>
                                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5 opacity-60">Unit {getUnitNumber(inv)}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isPaid
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : "bg-amber-50 text-amber-600 border-amber-100"
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 bg-white/50 p-4 rounded-2xl border border-gray-100/50">
                                            <div className="space-y-0.5">
                                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase opacity-40">Period</p>
                                                <p className="text-xs font-black text-[var(--color-secondary)]">{inv.month}</p>
                                            </div>
                                            <div className="space-y-0.5 text-right">
                                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase opacity-40">Settlement</p>
                                                <p className="text-xs font-black text-[var(--color-secondary)] italic">₹{total.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={() => setSelectedInvoice(inv)}
                                                variant="secondary"
                                                size="sm"
                                                icon={<Eye size={14} />}
                                                className="w-full"
                                            >
                                                Inspect
                                            </Button>
                                            <Button
                                                onClick={() => downloadInvoicePDF(inv)}
                                                variant="primary"
                                                size="sm"
                                                icon={<Download size={14} />}
                                                className="w-full bg-gray-900 shadow-black/10"
                                            >
                                                PDF
                                            </Button>
                                            {role === "tenant" && !isPaid && (
                                                <Button
                                                    onClick={() => handlePay(inv._id)}
                                                    variant="primary"
                                                    size="md"
                                                    className="col-span-2 tracking-widest"
                                                >
                                                    Finalize Payment
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </section>

            {/* ── MODALS (Unified Design) ───────────────────── */}
            {showCreate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setShowCreate(false); setFormData(initialFormData); }}></div>
                    <div className="bg-white border border-gray-100 rounded-[3rem] w-full max-w-4xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col relative">
                        <div className="px-10 pt-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-sm">
                                    <Receipt size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight">Generate Invoice</h2>
                                </div>
                            </div>
                            <Button
                                onClick={() => { setShowCreate(false); setFormData(initialFormData); }}
                                variant="secondary"
                                size="sm"
                                iconOnly
                                icon={<X size={20} />}
                            />
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Tenant Selector Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <User size={14} className="text-red-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Resident Allocation</h4>
                                </div>
                                <div className="relative">
                                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                    <select
                                        required
                                        value={formData.tenantId}
                                        onChange={(e) => handleTenantChange(e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-red-100 rounded-2xl pl-14 pr-12 h-16 text-sm font-bold text-[var(--color-secondary)] shadow-sm focus:outline-none appearance-none transition-all"
                                    >
                                        <option value="">Select Target Resident Account...</option>
                                        {tenants.map((t) => (
                                            <option key={t._id} value={t.userId?._id || t._id}>
                                                {t.userId?.name || t.name} — Unit {t.unitId?.unitNumber || "N/A"}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none opacity-40" />
                                </div>
                            </section>

                            {/* Financial Parameters */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <IndianRupee size={14} className="text-red-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Pricing Framework</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <Input label="MONTH" icon={Calendar} required placeholder="e.g. March 2026" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} />
                                    <Input label="RENT" icon={Home} type="number" required placeholder="0.00" value={formData.rent} onChange={(e) => setFormData({ ...formData, rent: e.target.value })} />
                                    <Input label="MAINTENANCE" icon={Wrench} type="number" placeholder="0.00" value={formData.maintenanceCharges} onChange={(e) => setFormData({ ...formData, maintenanceCharges: e.target.value })} />
                                    <Input label="UTILITY CHARGES" icon={Zap} type="number" placeholder="0.00" value={formData.utilityCharges} onChange={(e) => setFormData({ ...formData, utilityCharges: e.target.value })} />
                                    <Input label="LATE FEE" icon={Tag} type="number" placeholder="0.00" value={formData.lateFee} onChange={(e) => setFormData({ ...formData, lateFee: e.target.value })} />
                                    <Input label="DUE DATE" icon={Clock} type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <FileText size={14} className="text-red-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Additional Notes</h4>
                                </div>
                                <textarea
                                    rows="3"
                                    placeholder="Specify additional line items, discount rationale, or specialized instructions..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-red-100 rounded-[2rem] px-8 py-6 text-sm font-bold text-[var(--color-secondary)] transition-all focus:outline-none shadow-sm min-h-[120px] resize-none"
                                />
                            </section>

                            <div className="flex items-center justify-end gap-6 pt-6 border-t border-gray-50">
                                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowCreate(false); setFormData(initialFormData); }}>Discard</Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    htmlType="submit"
                                    variant="primary"
                                    size="lg"
                                    className="px-10 h-14"
                                    loading={submitting}
                                    loadingText="Processing Ledger..."
                                    icon={<Receipt size={18} />}
                                >
                                    AUTHORIZE INVOICE
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedInvoice && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSelectedInvoice(null)}
                    ></div>

                    <div className="relative bg-white border border-gray-200 rounded-[3rem] w-full max-w-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-10 pt-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                    <Receipt size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invoice Details</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        ID: {selectedInvoice.invoiceNumber || "PROVISIONAL"} — {selectedInvoice.status || "PENDING"}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setSelectedInvoice(null)}
                                variant="secondary"
                                size="sm"
                                iconOnly
                                icon={<X size={20} />}
                                className="hover:bg-gray-100 rounded-full"
                            />
                        </div>

                        {/* Content */}
                        <div className="px-10 py-5 overflow-y-auto custom-scrollbar space-y-5">
                            {/* Profile Section */}
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[22px] bg-white flex items-center justify-center text-2xl font-black text-red-600 shadow-sm border border-gray-100">
                                        {(getTenantName(selectedInvoice) || "U")[0]}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-gray-900 leading-tight">
                                            {getTenantName(selectedInvoice)}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Home size={12} className="text-gray-400" />
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Unit {getUnitNumber(selectedInvoice)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedInvoice.status === "Paid"
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-amber-50 text-amber-600 border-amber-100"
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedInvoice.status === "Paid" ? "bg-emerald-600" : "bg-amber-600"}`} />
                                        {selectedInvoice.status || "Pending"}
                                    </span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{selectedInvoice.month}</p>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Receipt size={14} className="text-red-600" />
                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Financial Summary</h4>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                                    <div className="divide-y divide-gray-50">
                                        {[
                                            { label: "Base Rent", value: selectedInvoice.rent, icon: Home },
                                            { label: "Utility Charges", value: selectedInvoice.utilityCharges, icon: Zap },
                                            { label: "Maintenance", value: selectedInvoice.maintenanceCharges, icon: Wrench },
                                            { label: "Late Fees", value: selectedInvoice.lateFee, icon: Tag },
                                        ].map((item, i) => (
                                            item.value > 0 && (
                                                <div key={i} className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <item.icon size={16} className="text-gray-400" />
                                                        <span className="text-sm font-bold text-gray-600">{item.label}</span>
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900">₹{item.value?.toLocaleString()}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>

                                    <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</span>
                                            <p className="text-sm font-black text-gray-900">{formatDate(selectedInvoice.dueDate)}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Total Payable</span>
                                            <p className="text-4xl font-black text-gray-900 tracking-tighter">
                                                ₹{getTotal(selectedInvoice).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {selectedInvoice.notes && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <AlertCircle size={14} className="text-red-600" />
                                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Annotations</h4>
                                    </div>
                                    <div className="bg-amber-50/30 border border-amber-100/50 rounded-2xl p-6 text-sm font-medium text-gray-700 leading-relaxed italic">
                                        "{selectedInvoice.notes}"
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-gray-50 shrink-0">
                                {role === "tenant" && selectedInvoice.status !== "Paid" && (
                                    <Button
                                        onClick={() => { handlePay(selectedInvoice._id); setSelectedInvoice(null); }}
                                        variant="primary"
                                        size="lg"
                                        className="flex-1 shadow-xl shadow-red-100"
                                        icon={<CreditCard size={18} />}
                                    >
                                        PROCEED TO PAY
                                    </Button>
                                )}
                                {role === "manager" && (
                                    <Button
                                        onClick={() => { handleDelete(selectedInvoice._id); setSelectedInvoice(null); }}
                                        variant="danger"
                                        size="lg"
                                        className="flex-1 shadow-lg shadow-rose-100"
                                        icon={<Trash size={18} />}
                                    >
                                        DELETE INVOICE
                                    </Button>
                                )}
                                <Button
                                    onClick={() => downloadInvoicePDF(selectedInvoice)}
                                    variant="secondary"
                                    size="lg"
                                    className={`${role === "manager" || (role === "tenant" && selectedInvoice.status === "Paid") ? "w-full" : "flex-1"}`}
                                    icon={<Download size={18} />}
                                >
                                    GET RECEIPT (PDF)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoice;