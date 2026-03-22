import { useState, useMemo, useEffect } from "react";
import React from "react";
import {
    Users,
    Home,
    Calendar,
    CreditCard,
    Search,
    Plus,
    Download,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    X,
    FileText,
    Mail,
    Phone,
    MapPin,
    Eye,
    Edit,
    Trash2,
    ChevronDown,
    ArrowRight,
    Smartphone,
    ShieldCheck,
    Briefcase,
    IndianRupee,
    Loader2
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
    const [filterProperty, setFilterProperty] = useState("All");

    const [isAddingTenant, setIsAddingTenant] = useState(false);
    const [allTenants, setAllTenants] = useState([]);
    const [properties, setProperties] = useState([]);
    const [floors, setFloors] = useState([]);
    const [units, setUnits] = useState([]);
    const [tenantUsers, setTenantUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

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
        maintenanceCost: 1000,
        paymentStatus: "Pending",
        avatar: "",
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormData);

    const isAuthorized = ["OWNER", "MANAGER"].includes(user?.role);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:7000/api/tenant/tenants", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setAllTenants(data.tenants);
        } catch (error) {
            console.error("Error fetching tenants:", error);
        } finally {
            setLoading(false);
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
                const onlyTenants = (data.msg || []).filter(u => u.role === "TENANT");
                setTenantUsers(onlyTenants);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTenants();
            fetchProperties();
            fetchTenantUsers();
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
                const filteredUnits = unitData.units.filter(u => {
                    const status = u.status?.toLowerCase() || "";
                    return status === "vacant" || u._id === existingUnitId;
                });
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
            maintenanceCost: tenant.maintenanceCost || 1000,
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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) return;

        try {
            const response = await fetch(`http://localhost:7000/api/tenant/tenant/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Tenant deleted successfully");
                fetchTenants();
            } else {
                toast.error(data.message || "Failed to delete tenant");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const summary = useMemo(() => {
        const totalUnits = properties.reduce((acc, curr) => acc + (curr.totalUnits || 0), 0);
        return [
            { label: "Total Residents", value: allTenants.length, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Active Leases", value: allTenants.filter(t => t.leaseStatus === "Active").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Unit Vacancy", value: Math.max(0, totalUnits - allTenants.length), icon: Home, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Critical Expiration", value: allTenants.filter(t => t.leaseStatus === "Expiring").length, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "Pending Dues", value: allTenants.filter(t => t.paymentStatus === "Pending").length, icon: CreditCard, color: "text-rose-500", bg: "bg-rose-50/50" },
            { label: "Occupancy Alpha", value: totalUnits > 0 ? `${Math.round((allTenants.length / totalUnits) * 100)}%` : "0%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        ];
    }, [allTenants, properties]);

    const filteredTenants = allTenants.filter((tenant) => {
        const name = tenant.userId?.name || tenant.name || "";
        const propName = tenant.propertyId?.propertyName || "";
        const unit = tenant.unitId?.unitNumber || "";

        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            propName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === "All" || tenant.paymentStatus === filterStatus || tenant.leaseStatus === filterStatus;
        const matchesProperty = filterProperty === "All" || tenant.propertyId?._id === filterProperty;

        return matchesSearch && matchesStatus && matchesProperty;
    });

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

            {/* Header Section */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="font-black text-[var(--color-secondary)] tracking-tight">
                        Tenant Management
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                        {["All", "Paid", "Pending", "Expiring"].map((status) => (
                            <Button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                variant={filterStatus === status ? "primary" : "ghost"}
                                size="xs"
                                className="whitespace-nowrap"
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                    {user?.role === "MANAGER" && (
                        <Button
                            onClick={() => setIsAddingTenant(true)}
                            variant="primary"
                            size="md"
                            icon={<Plus size={18} />}
                        >
                            REGISTER TENANT
                        </Button>
                    )}
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {summary.map((stat, i) => (
                    <div key={i} className="premium-card p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all hover:scale-[1.02] group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-[var(--color-secondary)] mb-1">{stat.value}</h3>
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--color-primary)] transition-all font-bold" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, property, or unit..."
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-[13px] font-bold text-[var(--color-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full lg:w-72 relative">
                    <select
                        value={filterProperty}
                        onChange={(e) => setFilterProperty(e.target.value)}
                        className="w-full h-12 bg-white border border-gray-100 rounded-2xl px-6 text-[12px] font-black uppercase tracking-widest text-[var(--color-secondary)] focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all appearance-none cursor-pointer shadow-sm"
                    >
                        <option value="All">All Properties</option>
                        {properties.map((p) => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                </div>
            </div>

            {/* Table Area */}
            <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">Crunching database records...</p>
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-['Inter']">
                        <thead className="bg-gray-50/50 border-b border-gray-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tenant Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Property</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Lease Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Rent</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTenants.length > 0 ? (
                                filteredTenants.map((tenant) => (
                                    <tr key={tenant._id} className="hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-[var(--color-primary)]">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-[var(--color-secondary)] truncate max-w-[200px]">{tenant.userId?.name || tenant.name}</p>
                                                    <p className="text-[10px] text-[var(--text-muted)] font-bold truncate max-w-[200px] opacity-60 mt-0.5">{tenant.userId?.email || tenant.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="space-y-0.5">
                                                <p className="text-[13px] font-bold text-[var(--color-secondary)]">{tenant.propertyId?.propertyName || "N/A"}</p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5"><MapPin size={10} className="text-rose-500" /> U-{tenant.unitId?.unitNumber || "?"} • {tenant.floorId?.name || "L?"}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <p className="text-[12px] font-bold text-[var(--color-secondary)]">{formatDate(tenant.leaseStart)}</p>
                                            <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-1 opacity-40">until {formatDate(tenant.leaseEnd)}</p>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[13px] font-black text-[var(--color-secondary)]">₹{(tenant.rent || 0).toLocaleString()}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${tenant.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-rose-500'} opacity-80 mt-1`}>{tenant.paymentStatus}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-center">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${tenant.leaseStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                tenant.leaseStatus === 'Expiring' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${tenant.leaseStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : tenant.leaseStatus === 'Expiring' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                {tenant.leaseStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button onClick={() => setSelectedTenant(tenant)} iconOnly variant="secondary" size="xs" icon={<Eye size={18} />} title="View Manifest" />
                                                {user?.role === "MANAGER" && (
                                                    <>
                                                        <Button onClick={() => handleEdit(tenant)} iconOnly variant="secondary" size="xs" icon={<Edit size={18} />} title="Modify Record" className="hover:text-blue-600 hover:border-blue-100" />
                                                        <Button onClick={() => handleDelete(tenant._id)} iconOnly variant="secondary" size="xs" icon={<Trash2 size={18} />} title="Purge Record" className="text-rose-300 hover:text-rose-600 hover:border-rose-100" />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Users size={60} className="text-gray-300" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">No match in manifest corpus</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Tenant Detail Modal */}
            {selectedTenant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setSelectedTenant(null)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight">Tenant Details</h2>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-1">
                                        ID: #{selectedTenant._id.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setSelectedTenant(null)}
                                iconOnly
                                variant="secondary"
                                size="xs"
                                icon={<X size={18} />}
                                className="hover:bg-gray-100"
                            />
                        </div>

                        {/* Body */}
                        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">

                            {/* Personal Information */}
                            <section className="space-y-4 text-center">
                                <div className="inline-block relative">
                                    <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                                        {selectedTenant.userId?.name ? selectedTenant.userId.name.split(' ').map(n => n[0]).join('') : "T"}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 p-2 bg-white rounded-xl shadow-lg border border-gray-50 text-emerald-500">
                                        <CheckCircle2 size={18} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight">
                                        {selectedTenant.userId?.name || selectedTenant.name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-4 mt-2">
                                        <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                                            <Mail size={12} className="text-indigo-400" />
                                            {selectedTenant.userId?.email || selectedTenant.email}
                                        </p>
                                        <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                                            <Phone size={12} className="text-indigo-400" />
                                            {selectedTenant.userId?.phone || selectedTenant.phone}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Property Assignment */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Home size={14} className="text-indigo-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Property Assignment</h4>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                    <div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Property</p>
                                        <p className="text-sm font-black text-[var(--color-secondary)]">{selectedTenant.propertyId?.propertyName || "N/A"}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Unit</p>
                                            <p className="text-xs font-black text-[var(--color-secondary)]">Suite {selectedTenant.unitId?.unitNumber || "N/A"}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Floor</p>
                                            <p className="text-xs font-black text-[var(--color-secondary)]">{selectedTenant.floorId?.name || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Financial Summary */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <IndianRupee size={14} className="text-indigo-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Financial Summary</h4>
                                </div>
                                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Monthly Rent</p>
                                            <p className="text-2xl font-black">₹{(selectedTenant.rent || 0).toLocaleString()}</p>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full bg-white/20 backdrop-blur-md`}>
                                            {selectedTenant.paymentStatus}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 p-6 gap-6 text-center">
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Paid Amount</p>
                                            <p className="text-sm font-black text-emerald-600">₹{(selectedTenant.totalCollected || 0).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Balance Due</p>
                                            <p className={`text-sm font-black ${selectedTenant.pending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₹{(selectedTenant.pending || 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Lease Information */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <FileText size={14} className="text-indigo-600" />
                                    <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Lease Information</h4>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Lease Start</p>
                                        <p className="text-sm font-black text-[var(--color-secondary)]">{formatDate(selectedTenant.leaseStart)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Lease End</p>
                                        <p className="text-sm font-black text-[var(--color-secondary)]">{formatDate(selectedTenant.leaseEnd)}</p>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-indigo-600" />
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Agreement</p>
                                        </div>
                                        <Button variant="secondary" size="xs" icon={<Download size={14} />} className="text-[10px] font-black">
                                            Download PDF
                                        </Button>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Footer Status */}
                        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm bg-white ${selectedTenant.leaseStatus === 'Active' ? 'text-emerald-600 border-emerald-100' : 'text-amber-600 border-amber-100'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${selectedTenant.leaseStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                {selectedTenant.leaseStatus} Status
                            </span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" icon={<Mail size={14} />}>Message</Button>
                                <Button variant="primary" size="sm" icon={<Phone size={14} />}>Call</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Add Tenant */}
            {isAddingTenant && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setIsAddingTenant(false); setEditId(null); setFormData(initialFormData); }}></div>
                    <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden flex flex-col">

                        <div className="px-6 py-1 border-b border-gray-50 flex items-center justify-between bg-white z-10">
                            <div>
                                <h2 className="text-[18px] font-black text-[var(--color-secondary)] tracking-tight">
                                    {editId ? "Edit Tenant" : "Add Tenant"}
                                </h2>
                            </div>
                            <Button onClick={() => { setIsAddingTenant(false); setEditId(null); setFormData(initialFormData); }} iconOnly variant="secondary" size="sm" icon={<X size={20} />} className="hover:bg-rose-50 hover:text-rose-600" />
                        </div>

                        <form className="p-6" onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {/* Identity Section */}
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm"><Users size={16} /></div>
                                            <h3 className="text-xs font-black text-[var(--color-secondary)] uppercase tracking-[0.1em]">Tenant Details</h3>
                                        </div>

                                        <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                                            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Briefcase size={12} /> Sync Existing User</p>
                                                <select
                                                    className="bg-white border border-gray-100 text-[11px] font-bold rounded-lg px-3 py-1.5 outline-none shadow-sm cursor-pointer hover:bg-gray-50"
                                                    onChange={(e) => {
                                                        const selected = tenantUsers.find(u => u._id === e.target.value);
                                                        if (selected) setFormData({ ...formData, name: selected.name, email: selected.email, phone: selected.phone || "" });
                                                    }}
                                                >
                                                    <option value="">Select Existing User</option>
                                                    {tenantUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required variant="formInput" placeholder="Tenant Name" />
                                                <Input label="Phone" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required variant="formInput" placeholder="Phone Number" />
                                            </div>
                                            <Input label="Email" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required variant="formInput" placeholder="Email Address" />
                                        </div>
                                    </section>

                                    {/* Asset Allocation */}
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg shadow-sm"><Home size={16} /></div>
                                            <h3 className="text-xs font-black text-[var(--color-secondary)] uppercase tracking-[0.1em]">Property Allocation</h3>
                                        </div>
                                        <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[var(--text-secondary)] text-sm font-semibold ml-1">Property</label>
                                                <div className="relative">
                                                    <select required className="w-full bg-white border border-gray-300 focus:border-indigo-400 text-[var(--text-secondary)] rounded-xl px-4 py-2.5 outline-none transition-all cursor-pointer shadow-sm appearance-none" value={formData.propertyId || ""} onChange={(e) => handlePropertyChange(e.target.value)}>
                                                        <option value="">Select Property</option>
                                                        {properties.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[var(--text-secondary)] text-sm font-semibold ml-1">Floor</label>
                                                    <div className="relative">
                                                        <select required disabled={!formData.propertyId} className="w-full bg-white border border-gray-300 focus:border-indigo-400 text-[var(--text-secondary)] rounded-xl px-4 py-2.5 outline-none transition-all cursor-pointer shadow-sm disabled:opacity-50 appearance-none" value={formData.floorId || ""} onChange={(e) => setFormData({ ...formData, floorId: e.target.value, unitId: "", rent: "", deposit: "" })}>
                                                            <option value="">Select Floor</option>
                                                            {floors.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[var(--text-secondary)] text-sm font-semibold ml-1">Unit</label>
                                                    <div className="relative">
                                                        <select required disabled={!formData.floorId} className="w-full bg-white border border-gray-300 focus:border-indigo-400 text-[var(--text-secondary)] rounded-xl px-4 py-2.5 outline-none transition-all cursor-pointer shadow-sm disabled:opacity-50 appearance-none" value={formData.unitId || ""} onChange={(e) => handleUnitChange(e.target.value)}>
                                                            <option value="">Select Unit</option>
                                                            {units.filter(u => (u.floorId?._id || u.floorId)?.toString() === formData.floorId?.toString()).map(u => <option key={u._id} value={u._id}>{u.unitNumber} ({u.unitType})</option>)}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div>
                                    {/* Financial Framework */}
                                    <section className="space-y-3 h-[calc(100%-1rem)]">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm"><IndianRupee size={16} /></div>
                                            <h3 className="text-xs font-black text-[var(--color-secondary)] uppercase tracking-[0.1em]">Financials & Timeline</h3>
                                        </div>
                                        <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 space-y-4 h-[calc(100%-2.5rem)]">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input type="date" label="Lease Start" value={formData.leaseStart || ""} onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })} required variant="formInput" />
                                                <Input type="date" label="Lease End" value={formData.leaseEnd || ""} onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })} required variant="formInput" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input type="number" label="Monthly Rent (₹)" value={formData.rent || ""} onChange={(e) => setFormData({ ...formData, rent: e.target.value })} required variant="formInput" />
                                                <Input type="number" label="Security Deposit (₹)" value={formData.deposit || ""} onChange={(e) => setFormData({ ...formData, deposit: e.target.value })} required variant="formInput" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-[var(--text-secondary)] text-sm font-semibold ml-1">Lease Status</label>
                                                    <div className="relative">
                                                        <select className="w-full bg-white border border-emerald-200 focus:border-emerald-400 text-[var(--color-secondary)] rounded-xl px-4 py-2.5 outline-none shadow-sm cursor-pointer appearance-none" value={formData.leaseStatus || "Active"} onChange={(e) => setFormData({ ...formData, leaseStatus: e.target.value })}>
                                                            <option value="Active">Active</option>
                                                            <option value="Expiring">Expiring</option>
                                                            <option value="Terminated">Terminated</option>
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[var(--text-secondary)] text-sm font-semibold ml-1">Payment Status</label>
                                                    <div className="relative">
                                                        <select className="w-full bg-white border border-emerald-200 focus:border-emerald-400 text-[var(--color-secondary)] rounded-xl px-4 py-2.5 outline-none shadow-sm cursor-pointer appearance-none" value={formData.paymentStatus || "Pending"} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Paid">Paid</option>
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-5 mt-2  border-t border-gray-50 bg-white">
                                <Button type="button" variant="ghost" size="sm" onClick={() => { setIsAddingTenant(false); setEditId(null); setFormData(initialFormData); }}>Cancel</Button>
                                <Button type="submit" htmlType="submit" loading={loading} variant="primary" size="md" icon={editId ? <Edit size={16} /> : <CheckCircle2 size={16} />}>
                                    {editId ? "Update Tenant" : "Save Tenant"}
                                </Button>
                            </div>
                        </form>
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
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default Tenant;
