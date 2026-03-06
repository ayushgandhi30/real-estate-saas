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
    Eye
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
            } (prev => prev.filter(p => p._id !== id));
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
        <div className="space-y-6 animate-fadeIn pt-4 px-4 sm:px-0">

            {/* Page Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        Property Assets
                    </h1>
                </div>
            </div>

            {/* Simplified Controls Bar */}
            <div className="w-full flex flex-col lg:flex-row items-center gap-4 px-4 sm:px-0">

                {/* 🔍 Search Input */}
                <div className="relative flex-1 w-full lg:w-auto">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-card)]"
                    />
                    <input
                        type="text"
                        placeholder="Search properties by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-[var(--bg-card)] border border-[var(--color-card)] rounded-2xl text-[var(--text-secondary)] placeholder-[var(--text-card)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                    />
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto">

                    {/* Category Selector */}
                    <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full h-12 px-4 pr-10 bg-[var(--bg-card)] border border-[var(--color-card)] rounded-2xl text-sm font-semibold text-[var(--text-secondary)] appearance-none focus:outline-none transition-all"
                        >
                            <option value="All">All Categories</option>
                            <option value="RESIDENTIAL">Residential</option>
                            <option value="COMMERCIAL">Commercial</option>
                            <option value="INDUSTRIAL">Industrial</option>
                        </select>
                        <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-card)] pointer-events-none" />
                    </div>

                    {/* Add Property Button */}
                    {(user?.role === "OWNER" || user?.role === "MANAGER") && (
                        <Button
                            onClick={() => { resetForm(); setOpenForm(true); }}
                            className="h-12 px-6 rounded-2xl bg-[var(--color-primary)] text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all border-none shadow-lg shadow-[var(--color-primary)]/20 whitespace-nowrap mt-[-3px]"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Property
                        </Button>
                    )}
                </div>
            </div>

            {/* List Table container */}
            <div className="bg-[var(--bg-card)]/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-card)]/30 border-b border-[var(--color-card)]">
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-[var(--text-card)]">Property Details</th>
                                {user?.role === "SUPER_ADMIN" && (
                                    <th className="p-6 font-bold text-xs uppercase tracking-widest text-[var(--text-card)]">Owner</th>
                                )}
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-[var(--text-card)]">Category</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-[var(--text-card)]">Location</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-[var(--text-card)]">Total Revenue</th>
                                <th className="p-6 font-bold text-xs uppercase tracking-widest text-[var(--text-card)] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-card)]">
                            {loading ? (
                                <tr><td colSpan={user?.role === "SUPER_ADMIN" ? "7" : "6"} className="p-16 text-center text-[var(--text-card)] font-medium animate-pulse">Synchronizing database...</td></tr>
                            ) : filteredProperties.length > 0 ? (
                                filteredProperties.map((property) => (
                                    <tr key={property._id} className="group hover:bg-[var(--color-card)]/20 transition-all duration-300">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">

                                                <div>
                                                    <div className="font-bold text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">{property.propertyName}</div>
                                                    <div className="text-xs text-[var(--text-card)] font-medium mt-1 truncate max-w-[200px]">{property.address}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {user?.role === "SUPER_ADMIN" && (
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-bold text-[var(--text-secondary)]">
                                                        {property.owner?.user?.name || "N/A"}
                                                        {property.owner?.companyName && (
                                                            <span className="block text-[10px] text-[var(--text-card)] font-medium uppercase">
                                                                {property.owner.companyName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${property.propertyType === 'RESIDENTIAL' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                property.propertyType === 'COMMERCIAL' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                    'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                                }`}>
                                                {property.propertyType}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold text-sm">
                                                {property.location}
                                            </div>
                                        </td>

                                        <td className="p-6">
                                            <div className="p-3 rounded-2xl">
                                                <div className="text-lg font-black text-green-600 dark:text-green-400 mt-1">${property.totalRevenue?.toLocaleString() || 0}</div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-1 transition-opacity duration-300">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProperty(property);
                                                        setOpenViewProperty(true);
                                                    }} className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all"><Eye size={18} /></button>
                                                {(user?.role === "OWNER" || user?.role === "MANAGER") && (
                                                    <>
                                                        <button onClick={() => handleEdit(property)} className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all"><Edit size={18} /></button>
                                                        <button onClick={() => handleDelete(property._id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><Trash2 size={18} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={user?.role === "SUPER_ADMIN" ? "7" : "6"} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-24 h-24 bg-[var(--color-card)] rounded-full flex items-center justify-center text-[var(--text-card)] border-4 border-[var(--color-card)] border-dashed animate-spin-slow">
                                                <Building2 size={40} />
                                            </div>
                                            <div className="text-xl font-black text-[var(--text-secondary)] mt-4 tracking-tight">No Estates Found</div>
                                            <p className="text-[var(--text-card)] text-sm max-w-xs">Your portfolio is currently empty. Start building your real estate empire today.</p>
                                            {(user?.role === "OWNER" || user?.role === "MANAGER") && (
                                                <Button onClick={() => setOpenForm(true)} className="mt-4 rounded-2xl px-10">Add Your First Property</Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Modal - Modern & Slick */}
            {
                openForm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="absolute inset-0  backdrop-blur-xl animate-fadeIn" onClick={resetForm}></div>

                        <div className="bg-[var(--bg-card)] w-full max-w-xl p-0 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-slideUp">
                            {/* Modal Header */}
                            <div className="p-8 pb-4 flex justify-between items-center relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-[var(--text-secondary)] tracking-tight">
                                        {isEditing ? "Modify Property" : "Establish Property"}
                                    </h3>
                                    <p className="text-[var(--text-card)] font-medium mt-1">Configure your real estate asset details</p>
                                </div>
                                <button onClick={resetForm} className="p-3 bg-[var(--color-card)] hover:bg-white/10 rounded-2xl text-[var(--text-secondary)] transition-all"><X size={24} /></button>
                            </div>

                            {/* Decoration Line */}
                            <div className="h-1 w-24 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 rounded-full mx-8 mb-6"></div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-8 pt-0 space-y-6 max-h-[70vh] overflow-y-auto relative z-10 custom-scrollbar"
                            >
                                <div className="space-y-6">

                                    {/* Property Name */}
                                    <Input
                                        label="Property Name"
                                        name="propertyName"
                                        value={formData.propertyName}
                                        onChange={handleChange}
                                        placeholder="e.g. Skyline Residency"
                                        variant="formInput"
                                        className="text-sm py-4 rounded-2xl bg-[var(--color-card)] border border-white/10 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition"
                                        required
                                    />

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">
                                            Property Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="2"
                                            placeholder="Brief description of the property..."
                                            className="w-full bg-[var(--color-card)] border border-white/10 rounded-2xl p-4 text-sm font-medium text-[var(--text-secondary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition resize-none placeholder-[var(--text-card)]"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">
                                                Category
                                            </label>
                                            <select
                                                name="propertyType"
                                                value={formData.propertyType}
                                                onChange={handleChange}
                                                className="w-full bg-[var(--color-card)] border border-white/10 rounded-2xl p-3.5 text-sm font-bold text-[var(--text-secondary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="RESIDENTIAL">Residential</option>
                                                <option value="COMMERCIAL">Commercial</option>
                                                <option value="INDUSTRIAL">Industrial</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">
                                                Status
                                            </label>
                                            <div className="flex items-center gap-3 p-3.5 bg-[var(--color-card)] border border-white/10 rounded-2xl">
                                                <input
                                                    type="checkbox"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 rounded-lg accent-[var(--color-primary)]"
                                                />
                                                <span className="text-sm font-bold text-[var(--text-secondary)]">Property Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assign Manager (Owner Only) */}
                                    {user?.role === "OWNER" && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">
                                                Assign Manager
                                            </label>
                                            <select
                                                name="manager"
                                                value={formData.manager}
                                                onChange={handleChange}
                                                className="w-full bg-[var(--color-card)] border border-white/10 rounded-2xl p-3.5 text-sm font-bold text-[var(--text-secondary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition appearance-none cursor-pointer"
                                            >
                                                <option value="">No Manager Assigned</option>
                                                {managers.map(m => (
                                                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Location & City/State */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Manhattan"
                                            variant="formInput"
                                            className="text-sm py-4 rounded-2xl bg-[var(--color-card)]"
                                            required
                                        />
                                        <Input
                                            label="City"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="e.g. New York"
                                            variant="formInput"
                                            className="text-sm py-4 rounded-2xl bg-[var(--color-card)]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Input
                                            label="State"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="e.g. NY"
                                            variant="formInput"
                                            className="text-sm py-4 rounded-2xl bg-[var(--color-card)]"
                                        />
                                        <Input
                                            label="Zip Code"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            placeholder="10001"
                                            variant="formInput"
                                            className="text-sm py-4 rounded-2xl bg-[var(--color-card)]"
                                        />
                                        <Input
                                            label="Country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            placeholder="USA"
                                            variant="formInput"
                                            className="text-sm py-4 rounded-2xl bg-[var(--color-card)]"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">
                                            Full Address
                                        </label>

                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows="2"
                                            placeholder="Enter precise location coordinates..."
                                            className="w-full bg-[var(--color-card)] border border-white/10 rounded-2xl p-4 text-sm font-medium text-[var(--text-secondary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 transition resize-none placeholder-[var(--text-card)]"
                                            required
                                        />
                                    </div>

                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-4 sticky  bg-[var(--bg-card)] mt-4 border-t border-white/5">

                                    <Button
                                        type="button"
                                        className="flex-1 py-4 bg-[var(--color-card)] hover:bg-white/10 text-[var(--text-secondary)] rounded-2xl font-bold border border-white/10"
                                        onClick={resetForm}
                                    >
                                        Discard
                                    </Button>

                                    <Button
                                        type="primary"
                                        className="flex-1 py-4 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 rounded-2xl font-black text-white border-none shadow-xl shadow-[var(--color-primary)]/40"
                                        htmlType="submit"
                                    >
                                        {isEditing ? "Update Asset" : "Deploy Property"}
                                    </Button>

                                </div>
                            </form>

                        </div>
                    </div>
                )
            }



            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--color-card);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--text-card);
                }
            `}</style>

            {
                openViewProperty && selectedProperty && (
                    <ViewProperty
                        property={selectedProperty}
                        onClose={() => setOpenViewProperty(false)}
                    />
                )
            }
        </div >
    );
};

export default Property;


function ViewProperty({ property, onClose }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl animate-fadeIn" onClick={onClose}></div>

            <div className="bg-[var(--bg-card)] w-full max-w-2xl p-0 rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden animate-slideUp">
                {/* Modal Header */}
                <div className="p-8 pb-4 flex justify-between items-center relative z-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                <Building2 size={24} />
                            </div>
                            <h3 className="text-3xl font-black text-[var(--text-secondary)] tracking-tight">
                                Property Details
                            </h3>
                        </div>
                        <p className="text-[var(--text-card)] font-medium mt-1 ml-11">
                            Comprehensive analysis of {property.propertyName}
                            {property.owner?.user?.name && <span className="ml-1 text-blue-500 text-xs font-bold"> • Owned by {property.owner.user.name}</span>}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-[var(--color-card)] hover:bg-white/10 rounded-2xl text-[var(--text-secondary)] transition-all"><X size={24} /></button>
                </div>

                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-8 mb-6"></div>

                <div className="p-8 pt-0 space-y-8 max-h-[75vh] overflow-y-auto relative z-10 custom-scrollbar">
                    {/* Hero Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-[var(--color-card)] rounded-3xl border border-white/5 space-y-1">
                            <div className="text-[10px] font-bold text-[var(--text-card)] uppercase tracking-wider">Total Units</div>
                            <div className="text-xl font-black text-[var(--text-secondary)]">{property.totalUnits}</div>
                        </div>
                        <div className="p-4 bg-green-500/5 rounded-3xl border border-green-500/10 space-y-1">
                            <div className="text-[10px] font-bold text-green-600/70 uppercase tracking-wider">Revenue</div>
                            <div className="text-xl font-black text-green-600">${property.totalRevenue?.toLocaleString()}</div>
                        </div>
                        <div className="p-4 bg-purple-500/5 rounded-3xl border border-purple-500/10 space-y-1">
                            <div className="text-[10px] font-bold text-purple-600/70 uppercase tracking-wider">Occupancy</div>
                            <div className="text-xl font-black text-purple-600">{Math.round(((property.totalUnits - property.vacantUnits) / property.totalUnits) * 100) || 0}%</div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black text-[var(--color-primary)] uppercase tracking-widest">
                                <LayoutGrid size={14} />
                                Basic Information
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm font-medium text-[var(--text-card)]">Category</span>
                                    <span className="text-sm font-bold text-[var(--text-secondary)]">{property.propertyType}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm font-medium text-[var(--text-card)]">Floors</span>
                                    <span className="text-sm font-bold text-[var(--text-secondary)]">{property.totalFloors || 1}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm font-medium text-[var(--text-card)]">Status</span>
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${property.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {property.isActive ? 'OPERATIONAL' : 'INACTIVE'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm font-medium text-[var(--text-card)]">Assigned Manager</span>
                                    <span className="text-sm font-bold text-[var(--text-secondary)]">
                                        {property.manager?.name || "Not Assigned"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-black text-[var(--color-primary)] uppercase tracking-widest">
                                <MapPin size={14} />
                                Geographical Data
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm font-medium text-[var(--text-card)]">City</span>
                                    <span className="text-sm font-bold text-[var(--text-secondary)]">{property.city || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm font-medium text-[var(--text-card)]">State</span>
                                    <span className="text-sm font-bold text-[var(--text-secondary)]">{property.state || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-sm font-medium text-[var(--text-card)]">Country</span>
                                    <span className="text-sm font-bold text-[var(--text-secondary)]">{property.country || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Large Text Sections */}
                    <div className="space-y-6">
                        <div className="p-6 bg-[var(--color-card)] rounded-[2rem] border border-white/5 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <MapPin size={48} />
                            </div>
                            <div className="text-[10px] font-black text-[var(--text-card)] uppercase tracking-widest mb-2">Primary Logistics Address</div>
                            <div className="text-sm font-bold text-[var(--text-secondary)] leading-relaxed">
                                {property.address}
                                <div className="text-xs text-[var(--text-card)] mt-1 font-medium">{property.zipCode && `Postal Code: ${property.zipCode}`}</div>
                            </div>
                        </div>

                        {property.description && (
                            <div className="p-6 bg-[var(--color-card)] rounded-[2rem] border border-white/5 min-h-[100px]">
                                <div className="text-[10px] font-black text-[var(--text-card)] uppercase tracking-widest mb-2">Asset Description</div>
                                <div className="text-sm font-medium text-[var(--text-card)] leading-relaxed italic">
                                    "{property.description}"
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="pt-4">
                        <Button
                            onClick={onClose}
                            className="w-full py-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                        >
                            CLOSE INSPECTION
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
