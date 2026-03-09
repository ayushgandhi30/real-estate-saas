import { useState, useMemo, useEffect } from "react";
import React from "react";
import {
    Users,
    Home,
    Calendar,
    CreditCard,
    Search,
    Plus,
    MoreVertical,
    Download,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    X,
    FileText,
    Mail,
    Phone,
    MapPin,
    LayoutGrid,
    Check
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../store/auth";
import { useToast } from "../store/ToastContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Tenant = () => {
    const { user, token } = useAuth();
    const { toast } = useToast();
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const [isAddingTenant, setIsAddingTenant] = useState(false);
    const [allTenants, setAllTenants] = useState([]);
    const [properties, setProperties] = useState([]);
    const [floors, setFloors] = useState([]);
    const [units, setUnits] = useState([]);
    const [tenantUsers, setTenantUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);

    const initialFormData = {
        name: "",
        email: "",
        phone: "",
        propertyId: "",
        unitId: "",
        floorId: "",
        managerId: user?.role === "MANAGER" ? user._id : "",
        leaseStart: "",
        leaseEnd: "",
        leaseStatus: "Active",
        rent: "",
        deposit: "",
        paymentStatus: "Pending",
        avatar: "",
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormData);

    const isAuthorized = ["OWNER", "MANAGER"].includes(user?.role);

    const fetchTenants = async () => {
        try {
            const response = await fetch("http://localhost:7000/api/tenant/tenants", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setAllTenants(data.tenants);
        } catch (error) {
            console.error("Error fetching tenants:", error);
        }
    };

    const fetchProperties = async () => {
        try {
            const response = await fetch("http://localhost:7000/api/owner/properties", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setProperties(data.properties);
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
    };

    const fetchTenantUsers = async () => {
        try {
            const response = await fetch("http://localhost:7000/api/auth/all-users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                // Filter users who are already TENANTS
                const onlyTenants = (data.msg || []).filter(u => u.role === "TENANT");
                setTenantUsers(onlyTenants);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchManagers = async () => {
        try {
            const response = await fetch("http://localhost:7000/api/auth/all-users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                const managersOnly = (data.msg || []).filter(u => u.role === "MANAGER" || u.role === "SUPER_ADMIN" || u.role === "OWNER");
                setManagers(managersOnly);
            }
        } catch (error) {
            console.error("Error fetching managers:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTenants();
            fetchProperties();
            fetchTenantUsers();
            fetchManagers();
        }
    }, [token]);

    const handlePropertyChange = async (propertyId, existingUnitId = null) => {
        if (!existingUnitId) {
            setFormData(prev => ({ ...prev, propertyId, floorId: "", unitId: "", rent: "", deposit: "" }));
        }

        try {
            const floorResponse = await fetch(`http://localhost:7000/api/owner/floors?propertyId=${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const floorData = await floorResponse.json();
            if (floorResponse.ok) setFloors(floorData.floors);

            const unitResponse = await fetch(`http://localhost:7000/api/owner/units?propertyId=${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const unitData = await unitResponse.json();
            if (unitResponse.ok) {
                // Keep units that are vacant OR the one already assigned to this tenant
                const filteredUnits = unitData.units.filter(u =>
                    u.status === "Vacant" || u._id === existingUnitId
                );
                setUnits(filteredUnits);
            }
        } catch (error) {
            console.error("Error fetching property details:", error);
        }
    };

    const handleUnitChange = (unitId) => {
        const selectedUnit = units.find(u => u._id === unitId);
        if (selectedUnit) {
            setFormData(prev => ({
                ...prev,
                unitId,
                rent: selectedUnit.rentAmount || "",
                deposit: selectedUnit.securityDeposit || ""
            }));
        } else {
            setFormData(prev => ({ ...prev, unitId, rent: "", deposit: "" }));
        }
    };

    const handleEdit = (tenant) => {
        const tenantPropId = tenant.propertyId?._id || tenant.propertyId || "";
        const tenantUnitId = tenant.unitId?._id || tenant.unitId || "";

        setFormData({
            name: tenant.userId?.name || tenant.name || "",
            email: tenant.userId?.email || tenant.email || "",
            phone: tenant.userId?.phone || tenant.phone || "",
            propertyId: tenantPropId,
            floorId: tenant.floorId?._id || tenant.floorId || "",
            unitId: tenantUnitId,
            managerId: tenant.managerId?._id || tenant.managerId || (user?.role === "MANAGER" ? user._id : ""),
            leaseStart: tenant.leaseStart ? new Date(tenant.leaseStart).toISOString().split('T')[0] : "",
            leaseEnd: tenant.leaseEnd ? new Date(tenant.leaseEnd).toISOString().split('T')[0] : "",
            leaseStatus: tenant.leaseStatus || "Active",
            rent: tenant.rent || "",
            deposit: tenant.deposit || "",
            paymentStatus: tenant.paymentStatus || "Pending",
            avatar: tenant.avatar || "",
            isActive: tenant.isActive ?? true
        });
        setEditId(tenant._id);
        setIsAddingTenant(true);

        if (tenantPropId) {
            handlePropertyChange(tenantPropId, tenantUnitId);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editId
                ? `http://localhost:7000/api/tenant/tenant/${editId}`
                : "http://localhost:7000/api/tenant/tenant";
            const method = editId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(editId ? "Tenant updated successfully" : "Tenant added successfully");
                setIsAddingTenant(false);
                setEditId(null);
                setFormData(initialFormData);
                fetchTenants();
            } else {
                toast.error(data.message || `Failed to ${editId ? "update" : "add"} tenant`);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const downloadLeasePDF = (tenant) => {
        const doc = new jsPDF();

        // Header styling
        doc.setFillColor(30, 41, 59); // Dark slate
        doc.rect(0, 0, 210, 40, 'F');

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("LEASE AGREEMENT", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`REFERENCE ID: LA-${tenant._id.substring(0, 8).toUpperCase()}`, 105, 30, { align: "center" });

        // Content
        let currentY = 55;

        const drawSectionHeader = (title, y) => {
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.setFont("helvetica", "bold");
            doc.text(title.toUpperCase(), 20, y);
            doc.setDrawColor(226, 232, 240);
            doc.line(20, y + 2, 190, y + 2);
            return y + 12;
        };

        // 1. Tenant Info
        currentY = drawSectionHeader("Tenant Information", currentY);
        autoTable(doc, {
            startY: currentY,
            body: [
                ["Full Legal Name", tenant.userId?.name || "N/A"],
                ["Email Address", tenant.userId?.email || "N/A"],
                ["Contact Number", tenant.userId?.phone || "N/A"],
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
            margin: { left: 20 }
        });

        // 2. Property Info
        currentY = doc.lastAutoTable.finalY + 15;
        currentY = drawSectionHeader("Lease Property Asset", currentY);
        autoTable(doc, {
            startY: currentY,
            body: [
                ["Property Name", tenant.propertyId?.propertyName || "N/A"],
                ["Floor Level", tenant.floorId?.name || "N/A"],
                ["Unit Number", tenant.unitId?.unitNumber || "N/A"],
                ["Property Address", tenant.propertyId?.address || "Available on portal"],
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
            margin: { left: 20 }
        });

        // 3. Lease & Financials
        currentY = doc.lastAutoTable.finalY + 15;
        currentY = drawSectionHeader("Lease Schedule & Financials", currentY);
        autoTable(doc, {
            startY: currentY,
            body: [
                ["Lease Term Start", new Date(tenant.leaseStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
                ["Lease Term End", new Date(tenant.leaseEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
                ["Monthly Installment", `INR ${tenant.rent?.toLocaleString()}`],
                ["Initial Security Deposit", `INR ${tenant.deposit?.toLocaleString()}`],
                ["Current Payment Status", tenant.paymentStatus],
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', width: 60 } },
            margin: { left: 20 }
        });

        // Declaration
        currentY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 116, 139);
        const declaration = "This document confirms that the above-mentioned tenant is officially registered at the specified property under current management. All terms are subject to the master agreement signed digitally and stored in our database records.";
        const splitText = doc.splitTextToSize(declaration, 170);
        doc.text(splitText, 20, currentY);

        // Signature area
        currentY += 25;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("Authorised Signatory", 20, currentY);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Digital Verification Enabled", 20, currentY + 5);

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
            doc.text(`Downloaded on ${new Date().toLocaleString()} | Real Estate SaaS Management Platform`, 105, 290, { align: "center" });
        }

        doc.save(`Lease_Agreement_${tenant.userId?.name?.replace(/\s+/g, '_')}_2025.pdf`);
        toast.success("Lease agreement generated and downloaded");
    };

    const summary = useMemo(() => {
        return {
            totalTenants: { value: allTenants.length, color: "text-blue-400", icon: Users, trend: "+4%" },
            activeLeases: { value: allTenants.filter(t => t.leaseStatus === "Active").length, color: "text-emerald-400", icon: CheckCircle2, trend: "+2%" },
            vacantUnits: { value: properties.reduce((acc, curr) => acc + (curr.totalUnits || 0), 0) - allTenants.length, color: "text-amber-400", icon: Home, trend: "-1%" },
            expiringCount: { value: allTenants.filter(t => t.leaseStatus === "Expiring").length, color: "text-rose-400", icon: AlertCircle, trend: "Static" },
            overduePayments: { value: allTenants.filter(t => t.paymentStatus === "Pending").length, color: "text-red-500", icon: CreditCard, trend: "+12%" },
            occupancyRate: { value: properties.length > 0 ? `${Math.round((allTenants.length / properties.reduce((acc, curr) => acc + (curr.totalUnits || 0), 0)) * 100)}%` : "0%", color: "text-purple-400", icon: TrendingUp, trend: "+1.5%" },
        };
    }, [allTenants, properties]);

    const filteredTenants = allTenants.filter(tenant => {
        const name = tenant.userId?.name || "";
        const prop = tenant.propertyId?.propertyName || "";
        const unit = tenant.unitId?.unitNumber || "";

        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prop.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "All" || tenant.paymentStatus === filterStatus || tenant.leaseStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "Paid": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "Pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case "Overdue": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            case "Active": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "Expiring": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-secondary)] p-4 sm:p-6 lg:p-2 font-[var(--font-body)] relative">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                {/* Page Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            Tenant Management
                        </h1>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:flex items-center gap-3">
                    <Button type="secondary" onClick={() => { }} className="mt-0! px-4! py-2! w-full md:w-auto">
                        <Download size={18} /> Export
                    </Button>
                    {(user?.role === "MANAGER" || user?.role === "OWNER") && (
                        <Button type="primary" onClick={() => setIsAddingTenant(true)} className="mt-0! px-4! py-2! w-full md:w-auto">
                            <Plus size={18} /> Add Tenant
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
                {Object.entries(summary).map(([key, data]) => {
                    const Icon = data.icon;
                    return (
                        <div key={key} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-white/5 shadow-xl transition-all hover:border-[var(--color-primary)]/30 group">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-xl bg-white/5 ${data.color} group-hover:scale-110 transition-transform`}>
                                    <Icon size={20} />
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${data.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                                    {data.trend}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{data.value}</h3>
                            <p className="text-[var(--text-card)] text-xs font-medium uppercase tracking-wider">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Filters and Search */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 border border-white/5 shadow-lg flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-card)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, property, or unit..."
                        className="w-full bg-[var(--bg-main)]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {["All", "Paid", "Pending", "Expiring"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${filterStatus === status
                                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                                : "bg-white/5 text-[var(--text-card)] border-white/5 hover:border-white/10"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                    <div className="h-10 w-px bg-white/10 mx-1 hidden md:block"></div>
                    <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-[var(--text-card)] focus:outline-none">
                        <option>All Properties</option>
                        <option>Skyline Heights</option>
                        <option>Green Valley</option>
                    </select>
                </div>
            </div>

            {/* Table/Card View Section */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                {/* Desktop Table View (Hidden on Mobile/Tablet) */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-[var(--text-card)] text-xs uppercase tracking-widest font-bold">
                                <th className="px-6 py-4">Tenant</th>
                                <th className="px-6 py-4">Property & Unit</th>
                                <th className="px-6 py-4">Lease Period</th>
                                <th className="px-6 py-4">Rent (m)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTenants.length > 0 ? (
                                filteredTenants.map((tenant) => (
                                    <tr
                                        key={tenant._id || tenant.id}
                                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => setSelectedTenant(tenant)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                    {tenant.avatar || (tenant.userId?.name ? tenant.userId.name.split(' ').map(n => n[0]).join('') : "T")}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">{tenant.userId?.name || tenant.name}</p>
                                                    <p className="text-[var(--text-card)] text-xs">{tenant.userId?.email || tenant.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-white text-sm font-medium">{tenant.propertyId?.propertyName || tenant.property}</p>
                                            <div className="flex items-center gap-1.5 text-[var(--text-card)] text-xs mt-0.5">
                                                <Home size={12} />
                                                <span>Unit {tenant.unitId?.unitNumber || tenant.unit} • {tenant.floorId?.name || tenant.floor}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm">
                                            <div className="flex items-center gap-1 text-white">
                                                <Calendar size={14} className="text-[var(--color-primary)]" />
                                                <span>Ends {tenant.leaseEnd ? new Date(tenant.leaseEnd).toLocaleDateString() : tenant.leaseEnd}</span>
                                            </div>
                                            <p className="text-[var(--text-card)] text-xs mt-1">Started {tenant.leaseStart ? new Date(tenant.leaseStart).toLocaleDateString() : tenant.leaseStart}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-white font-bold text-sm">₹{tenant.rent?.toLocaleString()}</p>

                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(tenant.paymentStatus)}`}>
                                                {tenant.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-card)] hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                                                    <Mail size={16} />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-card)] hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users size={48} className="text-white/10" />
                                            <p className="text-[var(--text-card)]">No tenants found matching your criteria.</p>
                                            <Button type="outline" onClick={() => { setSearchQuery(""); setFilterStatus("All") }} className="mt-2! py-2!">
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View (Hidden on Desktop) */}
                <div className="lg:hidden divide-y divide-white/5">
                    {filteredTenants.length > 0 ? (
                        filteredTenants.map((tenant) => (
                            <div
                                key={tenant.id}
                                className="p-4 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer"
                                onClick={() => setSelectedTenant(tenant)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            {tenant.avatar}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold text-sm">{tenant.userId?.name || tenant.name}</h4>
                                            <p className="text-[var(--text-card)] text-xs">{tenant.propertyId?.propertyName || tenant.property} • {tenant.unitId?.unitNumber || tenant.unit}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getStatusColor(tenant.paymentStatus)}`}>
                                        {tenant.paymentStatus}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="space-y-1">
                                        <p className="text-[var(--text-card)] uppercase tracking-wider font-bold text-[9px]">Lease End</p>
                                        <div className="flex items-center gap-1.5 text-white">
                                            <Calendar size={12} className="text-[var(--color-primary)]" />
                                            <span>{tenant.leaseEnd}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[var(--text-card)] uppercase tracking-wider font-bold text-[9px]">Monthly Rent</p>
                                        <p className="text-white font-bold">₹{tenant.rent.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${tenant.pending > 0 ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                        {tenant.pending > 0 ? `₹${tenant.pending.toLocaleString()} Due` : 'Payment Clear'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-card)]" onClick={(e) => e.stopPropagation()}>
                                            <Mail size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-card)]" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center">
                            <Users size={40} className="mx-auto text-white/10 mb-3" />
                            <p className="text-[var(--text-card)] text-sm">No results found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tenant Detail Drawer */}
            {selectedTenant && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTenant(null)}></div>
                    <div className="relative w-full sm:max-w-md lg:max-w-lg bg-[var(--bg-card)] h-full overflow-y-auto shadow-2xl border-l border-white/10 animate-slide-in">
                        <div className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-white/5 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Tenant Details</h2>
                            <button
                                onClick={() => setSelectedTenant(null)}
                                className="p-2 hover:bg-white/5 rounded-full text-[var(--text-card)] hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl mb-4 border-4 border-white/5">
                                    {selectedTenant.avatar || (selectedTenant.userId?.name ? selectedTenant.userId.name.split(' ').map(n => n[0]).join('') : "T")}
                                </div>
                                <h3 className="text-2xl font-bold text-white">{selectedTenant.userId?.name || selectedTenant.name}</h3>
                                <div className="flex flex-col gap-1 mt-1">
                                    <p className="text-[var(--text-card)] flex items-center justify-center gap-2">
                                        <Mail size={14} /> {selectedTenant.userId?.email || selectedTenant.email}
                                    </p>
                                    <p className="text-[var(--text-card)] flex items-center justify-center gap-2">
                                        <Phone size={14} /> {selectedTenant.userId?.phone || selectedTenant.phone}
                                    </p>
                                </div>
                                <p className="text-[var(--text-card)] flex items-center justify-center gap-2 mt-3">
                                    <span className={`w-2 h-2 rounded-full ${selectedTenant.leaseStatus === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                                    {selectedTenant.leaseStatus} Lease
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <Button type="secondary" className="mt-0! w-full py-2.5! rounded-2xl!">
                                    <Mail size={16} className="mr-2" /> Message
                                </Button>
                                <Button type="outline" className="mt-0! w-full py-2.5! rounded-2xl!">
                                    <Phone size={16} className="mr-2" /> Call
                                </Button>
                            </div>

                            {/* Info Sections */}
                            <div className="space-y-8">
                                <section>
                                    <h4 className="text-[var(--text-card)] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Home size={14} /> Property Details
                                    </h4>
                                    <div className="bg-white/5 rounded-2xl p-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[var(--text-card)]">Property</span>
                                            <span className="text-sm font-medium text-white">{selectedTenant.propertyId?.propertyName || selectedTenant.property}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[var(--text-card)]">Unit / Floor</span>
                                            <span className="text-sm font-medium text-white">{selectedTenant.unitId?.unitNumber || selectedTenant.unit} / {selectedTenant.floorId?.name || selectedTenant.floor}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[var(--text-card)]">Property Manager</span>
                                            <span className="text-sm font-medium text-white">{selectedTenant.managerId?.name || selectedTenant.manager}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                            <span className="text-sm text-[var(--text-card)]">Rent Amount</span>
                                            <span className="text-base font-bold text-[var(--color-primary)]">₹{selectedTenant.rent?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[var(--text-card)] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CreditCard size={14} /> Financial Status
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-2xl p-4">
                                            <p className="text-[var(--text-card)] text-[10px] uppercase mb-1">Total Collected</p>
                                            <p className="text-lg font-bold text-white">₹{selectedTenant.totalCollected.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4">
                                            <p className="text-[var(--text-card)] text-[10px] uppercase mb-1">Balance Due</p>
                                            <p className={`text-lg font-bold ${selectedTenant.pending > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>₹{selectedTenant.pending.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4">
                                            <p className="text-[var(--text-card)] text-[10px] uppercase mb-1">Security Deposit</p>
                                            <p className="text-lg font-bold text-white">₹{selectedTenant.deposit.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4">
                                            <p className="text-[var(--text-card)] text-[10px] uppercase mb-1">Payment Status</p>
                                            <p className={`text-sm font-bold ${selectedTenant.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedTenant.paymentStatus}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[var(--text-card)] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FileText size={14} /> Lease Documents
                                    </h4>
                                    <div
                                        onClick={() => downloadLeasePDF(selectedTenant)}
                                        className="bg-white/5 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/[0.08] transition-colors border border-white/5 hover:border-[var(--color-primary)]/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white group-hover:text-[var(--color-primary)] transition-colors">Lease_Agreement_2025.pdf</p>
                                                <p className="text-[10px] text-[var(--text-card)]">Ready to download • Signed</p>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-[var(--color-primary)]/10 text-[var(--text-card)] group-hover:text-[var(--color-primary)] transition-all">
                                            <Download size={16} />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {(user?.role === "OWNER" || user?.role === "MANAGER") && (
                                <div className="mt-12 mb-8">
                                    <Button
                                        type="primary"
                                        className="w-full! rounded-2xl! py-4! font-bold text-base"
                                        onClick={() => handleEdit(selectedTenant)}
                                    >
                                        Edit Tenant Profile
                                    </Button>
                                    <p className="text-center text-xs text-[var(--text-card)] mt-4">Last update: 2 hours ago by System</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}



            {/* Modal for Add Tenant */}
            {isAddingTenant && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => {
                        setIsAddingTenant(false);
                        setEditId(null);
                        setFormData(initialFormData);
                    }}></div>
                    <div className="relative w-full max-w-4xl bg-[var(--bg-card)] md:rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-zoom-in h-fit max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="sticky top-0 z-10 bg-[var(--bg-card)] p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                {editId ? "Edit Tenant Profile" : "Add New Tenant"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsAddingTenant(false);
                                    setEditId(null);
                                    setFormData(initialFormData);
                                }}
                                className="p-2 hover:bg-white/5 rounded-full text-[var(--text-card)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8">
                            <form className="space-y-8" onSubmit={handleFormSubmit}>
                                {/* 👤 Tenant & Property Selection */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Users size={20} className="text-[var(--color-primary)]" />
                                        Resident Identification
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-sm font-semibold text-[var(--text-secondary)]">Search Existing User?</span>
                                            <select
                                                className="bg-[var(--bg-main)] border border-gray-600 text-xs rounded-lg px-2 py-1 outline-none"
                                                onChange={(e) => {
                                                    const selected = tenantUsers.find(u => u._id === e.target.value);
                                                    if (selected) {
                                                        setFormData({
                                                            ...formData,
                                                            name: selected.name,
                                                            email: selected.email,
                                                            phone: selected.phone || ""
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">-- Select from existing users --</option>
                                                {tenantUsers.map(u => (
                                                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <Input
                                                label="Full Name"
                                                required
                                                placeholder="Resident's complete name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                            <Input
                                                label="Email Address"
                                                type="email"
                                                required
                                                placeholder="resident@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                            <Input
                                                label="Phone Number"
                                                required
                                                placeholder="+91 XXXXX XXXXX"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[var(--text-secondary)]">Property</label>
                                            <select
                                                required
                                                className="w-full bg-[var(--bg-main)] border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl px-4 py-3 outline-none"
                                                value={formData.propertyId}
                                                onChange={(e) => handlePropertyChange(e.target.value)}
                                            >
                                                <option value="">Select Property</option>
                                                {properties.map(p => (
                                                    <option key={p._id} value={p._id}>{p.propertyName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[var(--text-secondary)]">Floor</label>
                                            <select
                                                required
                                                disabled={!formData.propertyId}
                                                className="w-full bg-[var(--bg-main)] border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl px-4 py-3 outline-none disabled:opacity-50"
                                                value={formData.floorId}
                                                onChange={(e) => setFormData({ ...formData, floorId: e.target.value, unitId: "", rent: "", deposit: "" })}
                                            >
                                                <option value="">Select Floor</option>
                                                {floors.map(f => (
                                                    <option key={f._id} value={f._id}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[var(--text-secondary)]">Unit</label>
                                            <select
                                                required
                                                disabled={!formData.floorId}
                                                className="w-full bg-[var(--bg-main)] border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl px-4 py-3 outline-none disabled:opacity-50"
                                                value={formData.unitId}
                                                onChange={(e) => handleUnitChange(e.target.value)}
                                            >
                                                <option value="">Select Unit</option>
                                                {units.filter(u => (u.floorId?._id || u.floorId) === formData.floorId).map(u => (
                                                    <option key={u._id} value={u._id}>{u.unitNumber} ({u.unitType})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 📅 Lease & Financials */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 pt-4 border-t border-white/5">
                                        <FileText size={20} className="text-[var(--color-primary)]" />
                                        Lease & Financial Framework
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <Input
                                            label="Lease Start"
                                            type="date"
                                            required
                                            value={formData.leaseStart}
                                            onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                                        />
                                        <Input
                                            label="Lease End"
                                            type="date"
                                            required
                                            value={formData.leaseEnd}
                                            onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                                        />
                                        <Input
                                            label="Monthly Rent (₹)"
                                            type="number"
                                            required
                                            placeholder="25000"
                                            value={formData.rent}
                                            onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                                        />
                                        <Input
                                            label="Security Deposit (₹)"
                                            type="number"
                                            placeholder="50000"
                                            value={formData.deposit}
                                            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[var(--text-secondary)]">Lease Status</label>
                                            <select
                                                className="w-full bg-[var(--bg-main)] border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl px-4 py-3 outline-none"
                                                value={formData.leaseStatus}
                                                onChange={(e) => setFormData({ ...formData, leaseStatus: e.target.value })}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Expiring">Expiring</option>
                                                <option value="Expired">Expired</option>
                                                <option value="Terminated">Terminated</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[var(--text-secondary)]">Initial Payment Status</label>
                                            <select
                                                className="w-full bg-[var(--bg-main)] border border-gray-600 focus:border-[var(--color-primary)] text-[var(--text-secondary)] rounded-xl px-4 py-3 outline-none"
                                                value={formData.paymentStatus}
                                                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Paid">Paid</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-white/5">
                                    <Button
                                        type="secondary"
                                        onClick={() => {
                                            setIsAddingTenant(false);
                                            setEditId(null);
                                            setFormData(initialFormData);
                                        }}
                                        className="flex-1! mt-0! py-4! text-base"
                                    >
                                        Discard Changes
                                    </Button>
                                    <Button type="primary" htmlType="submit" disabled={loading} className="flex-1! mt-0! py-4! text-base">
                                        {loading ? (editId ? "Updating..." : "Registering...") : (editId ? "Update Tenant Profile" : "Finalize Tenant Registration")}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )
            }


            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes zoom-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-slide-in {
                    animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .animate-zoom-in {
                    animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>

        </div >
    );
};

export default Tenant;
