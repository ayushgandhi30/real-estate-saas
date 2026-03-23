import React, { useEffect, useState } from "react";
import {
    Building2,
    MapPin,
    Home,
    Edit,
    Trash2,
    X,
    Plus,
    LayoutGrid,
    Search,
    Filter,
    Eye,
    ChevronDown,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Globe,
    Briefcase,
    Loader2,
    User
} from "lucide-react";
import { useAuth } from "../store/auth";
import { useToast } from "../store/ToastContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const initialState = {
    propertyName: "",
    propertyType: "RESIDENTIAL",
    description: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isActive: true,
    manager: ""
};

const Property = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [managers, setManagers] = useState([]);
    const [formData, setFormData] = useState(initialState);
    const [openForm, setOpenForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    const [openViewProperty, setOpenViewProperty] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const isEditing = Boolean(editId);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:7000/api/owner/properties", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                setProperties(data.properties || []);
            } else {
                toast.error(data.message || "Failed to fetch properties");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching properties");
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        if (user?.role !== "OWNER") return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:7000/api/owner/managers", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setManagers(data.managers || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProperties();
        fetchManagers();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const resetForm = () => {
        setFormData(initialState);
        setEditId(null);
        setOpenForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const url = isEditing
                ? `http://localhost:7000/api/owner/property/${editId}`
                : `http://localhost:7000/api/owner/properties`;

            const method = isEditing ? "PUT" : "POST";

            const submitData = { ...formData };
            if (!submitData.manager || submitData.manager === "") {
                delete submitData.manager;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(isEditing ? "Property Updated Successfully" : "Property Added Successfully");
                fetchProperties();
                resetForm();
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (property) => {
        setFormData({
            propertyName: property.propertyName,
            propertyType: property.propertyType,
            description: property.description || "",
            location: property.location,
            address: property.address,
            city: property.city || "",
            state: property.state || "",
            zipCode: property.zipCode || "",
            country: property.country || "",
            isActive: property.isActive,
            manager: property.manager?._id || ""
        });
        setEditId(property._id);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this property?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:7000/api/owner/property/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success("Property Deleted Successfully");
                setProperties(prev => prev.filter(p => p._id !== id));
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    const filteredProperties = properties.filter(p => {
        const matchesSearch = p.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "All" || p.propertyType === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

            {/* Header Section */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="font-black text-[var(--color-secondary)] tracking-tight">
                        Property Management
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                        {["All", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"].map((type) => (
                            <Button
                                key={type}
                                onClick={() => setFilterType(type)}
                                variant={filterType === type ? "primary" : "ghost"}
                                size="xs"
                                className="whitespace-nowrap"
                            >
                                {type === "All" ? "All Assets" : type}
                            </Button>
                        ))}
                    </div>
                    {(user?.role === "OWNER" || user?.role === "MANAGER") && (
                        <Button
                            onClick={() => { resetForm(); setOpenForm(true); }}
                            className="w-full sm:w-auto"
                            variant="primary"
                            size="md"
                            icon={<Plus size={18} />}
                        >
                            NEW PROPERTY
                        </Button>
                    )}
                </div>
            </header>

            {/* Content Area */}
            <section className="space-y-6">
                <div className="relative group w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--color-primary)] transition-all font-bold" size={16} />
                    <input
                        type="text"
                        placeholder="Search by property name or location..."
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-[13px] font-bold text-[var(--color-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm min-h-[400px] relative">
                    {loading ? (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                            <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
                            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">Synchronizing database...</p>
                        </div>
                    ) : null}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-['Inter']">
                            <thead className="bg-gray-50/50 border-b border-gray-50">
                                <tr>
                                    <th className="px-8 pt-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Property Details</th>
                                    {user?.role === "SUPER_ADMIN" && (
                                        <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Owner</th>
                                    )}
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Location</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Total Revenue</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProperties.length > 0 ? (
                                    filteredProperties.map((property) => (
                                        <tr key={property._id} className="hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-[var(--color-primary)]">
                                            <td className="px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-sm">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-[var(--color-secondary)] truncate max-w-[200px]">{property.propertyName}</p>
                                                        <p className="text-[10px] text-[var(--text-muted)] font-bold truncate max-w-[200px] opacity-60 mt-0.5">{property.address}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {user?.role === "SUPER_ADMIN" && (
                                                <td className="px-8 py-7">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[12px] font-black text-[var(--color-secondary)]">{property.owner?.user?.name || "N/A"}</p>
                                                        {property.owner?.companyName && <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">{property.owner.companyName}</p>}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-8 py-7">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${property.propertyType === 'RESIDENTIAL' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                    property.propertyType === 'COMMERCIAL' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-purple-50 text-purple-600 border-purple-100'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${property.propertyType === 'RESIDENTIAL' ? 'bg-indigo-500' : property.propertyType === 'COMMERCIAL' ? 'bg-amber-500' : 'bg-purple-500'}`} />
                                                    {property.propertyType}
                                                </span>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--color-secondary)]">
                                                    <MapPin size={12} className="text-rose-500" />
                                                    {property.location}
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[15px] font-black text-emerald-600 tracking-tight">₹{property.totalRevenue?.toLocaleString() || 0}</span>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase mt-1 opacity-40">
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button onClick={() => { setSelectedProperty(property); setOpenViewProperty(true); }} iconOnly variant="secondary" size="xs" icon={<Eye size={18} />} title="Inspect Asset" />
                                                    {(user?.role === "OWNER" || user?.role === "MANAGER") && (
                                                        <>
                                                            <Button onClick={() => handleEdit(property)} iconOnly variant="secondary" size="xs" icon={<Edit size={18} />} title="Modify Asset" className="hover:text-blue-600 hover:border-blue-100" />
                                                            <Button onClick={() => handleDelete(property._id)} iconOnly variant="secondary" size="xs" icon={<Trash2 size={18} />} title="Purge Asset" className="text-rose-300 hover:text-rose-600 hover:border-rose-100" />
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={user?.role === "SUPER_ADMIN" ? "6" : "5"} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Building2 size={60} className="text-gray-300" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">No match in portfolio manifest</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* View Property Drawer */}
            {openViewProperty && selectedProperty && (
                <ViewProperty property={selectedProperty} onClose={() => setOpenViewProperty(false)} />
            )}

            {/* Add Property Modal */}
            {openForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={resetForm}></div>
                    <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden flex flex-col">

                        <div className="px-8 pt-5 border-b border-gray-50 flex items-center justify-between bg-white z-10">
                            <div>
                                <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight">
                                    {isEditing ? "Modify Property" : "Create New Property"}
                                </h2>
                            </div>
                            <Button onClick={resetForm} iconOnly variant="secondary" size="sm" icon={<X size={20} />} className="hover:bg-rose-50 hover:text-rose-600" />
                        </div>

                        <form className="px-8 py-3" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Core Specification */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-sm"><MapPin size={20} /></div>
                                        <h3 className="text-sm font-black text-[var(--color-secondary)] uppercase tracking-[0.1em]">Property Details</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <Input
                                            label="Property Name"
                                            name="propertyName"
                                            value={formData.propertyName}
                                            onChange={handleChange}
                                            required
                                            variant="formInput"
                                            placeholder="e.g. Skyline Corporate Center"
                                        />

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="block text-[var(--text-secondary)] text-sm font-semibold">Property Type</label>
                                                <div className="relative">
                                                    <select
                                                        name="propertyType"
                                                        value={formData.propertyType}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-3 border border-gray-100 focus:border-[var(--color-primary)]/40 text-[var(--text-secondary)] rounded-xl outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-md appearance-none cursor-pointer text-sm font-semibold"
                                                    >
                                                        <option value="RESIDENTIAL">Residential Asset</option>
                                                        <option value="COMMERCIAL">Commercial Hub</option>
                                                        <option value="INDUSTRIAL">Industrial Site</option>
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none opacity-40" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[var(--text-secondary)] text-sm font-semibold">Status</label>
                                                <div className="flex items-center h-[52px] px-6 bg-gray-50 rounded-2xl border border-transparent hover:bg-white hover:border-indigo-100 transition-all cursor-pointer group" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                                                    <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${formData.isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${formData.isActive ? 'left-[18px]' : 'left-0.5'}`} />
                                                    </div>
                                                    <span className="ml-3 text-[10px] font-black uppercase text-[var(--color-secondary)]">Mark as Operational</span>
                                                </div>
                                            </div>
                                        </div>

                                        {user?.role === "OWNER" && (
                                            <div className="space-y-2">
                                                <label className="block text-[var(--text-secondary)] text-sm font-semibold">Property Manager</label>
                                                <div className="relative">
                                                    <select
                                                        name="manager"
                                                        value={formData.manager}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-gray-100 focus:border-[var(--color-primary)]/40 text-[var(--text-secondary)] rounded-xl outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-md appearance-none cursor-pointer text-sm font-semibold"
                                                    >
                                                        <option value="">Retain Direct Command (No Manager)</option>
                                                        {managers.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none opacity-40" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="block text-[var(--text-secondary)] text-sm font-semibold">Property Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[var(--color-primary)]/20 rounded-2xl px-6 py-4 text-xs font-medium text-[var(--color-secondary)] shadow-sm focus:outline-none min-h-[100px] resize-none"
                                                placeholder="Specify property highlights, structural details, or strategic advantages..."
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Logistics Location */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-sm"><MapPin size={20} /></div>
                                        <h3 className="text-sm font-black text-[var(--color-secondary)] uppercase tracking-[0.1em]">Geographical Logistics</h3>
                                    </div>

                                    <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 space-y-6">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <Input
                                                label="Location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                required
                                                variant="formInput"
                                                placeholder="e.g. Bandra West"
                                            />
                                            <Input
                                                label="City"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                variant="formInput"
                                                placeholder="e.g. Mumbai"
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <Input
                                                label="State"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                variant="formInput"
                                                placeholder="Maharashtra"
                                            />
                                            <Input
                                                label="Zip Code"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleChange}
                                                variant="formInput"
                                                placeholder="400050"
                                            />
                                            <Input
                                                label="Country"
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                variant="formInput"
                                                placeholder="India"
                                            />
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <label className="block text-[var(--text-secondary)] text-sm font-semibold">Address</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white border border-transparent focus:border-rose-100 rounded-2xl px-6 py-4 text-xs font-medium text-[var(--color-secondary)] shadow-sm focus:outline-none min-h-[80px] resize-none"
                                                placeholder="Enter precise logistical address coordinate..."
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="flex items-center justify-end gap-6 pt-6  border-t border-gray-50 bg-white">
                                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
                                <Button type="submit" htmlType="submit" variant="primary" size="lg" icon={isEditing ? <Edit size={18} /> : <ArrowRight size={18} />}>
                                    {isEditing ? "Update Property" : "Create Property"}
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

export default Property;

function ViewProperty({ property, onClose }) {
    if (!property) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 pt-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight">Property Details</h2>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-1">
                                {property.propertyType}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={onClose}
                        iconOnly
                        variant="secondary"
                        size="xs"
                        icon={<X size={18} />}
                        className="hover:bg-gray-100"
                    />
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight leading-tight">
                            {property.propertyName}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                            {property.description || "No description provided for this property."}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-5 bg-gray-50 rounded-3xl text-center space-y-1">
                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Units</p>
                            <p className="text-lg font-black text-[var(--color-secondary)]">{property.totalUnits || 0}</p>
                        </div>
                        <div className="p-5 bg-indigo-50 rounded-3xl text-center space-y-1">
                            <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Revenue</p>
                            <p className="text-lg font-black text-indigo-700">₹{(property.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-3xl text-center space-y-1">
                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Floors</p>
                            <p className="text-lg font-black text-[var(--color-secondary)]">{property.totalFloors || 1}</p>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <MapPin size={14} className="text-indigo-600" />
                            <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Location Info</h4>
                        </div>
                        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">City</p>
                                    <p className="text-xs font-bold text-[var(--color-secondary)]">{property.city || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">State</p>
                                    <p className="text-xs font-bold text-[var(--color-secondary)]">{property.state || "N/A"}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Address</p>
                                <p className="text-xs font-medium text-[var(--color-secondary)] leading-relaxed">{property.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Manager Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <User size={14} className="text-indigo-600" />
                            <h4 className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest">Assigned Manager</h4>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[2rem]">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-sm font-black text-indigo-600 shadow-sm">
                                {property.manager?.name ? property.manager.name[0] : "A"}
                            </div>
                            <div>
                                <p className="text-sm font-black text-[var(--color-secondary)]">{property.manager?.name || "Unassigned"}</p>
                                <p className="text-xs font-medium text-[var(--text-muted)]">{property.manager?.email || "No contact info"}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer / Status */}
                <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${property.isActive ? 'bg-white text-emerald-600 border-emerald-100' : 'bg-white text-rose-600 border-rose-100'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${property.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {property.isActive ? 'Active Status' : 'Inactive Status'}
                    </span>
                </div>
            </div>
        </div>
    );
}