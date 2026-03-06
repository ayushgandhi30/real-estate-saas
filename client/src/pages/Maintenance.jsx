import React, { useEffect, useState } from "react";
import {
    Wrench,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    AlertTriangle,
    User,
    Building2,
    MoreVertical,
    Eye,
    Send,
    Loader2,
    Calendar,
    ArrowRight
} from "lucide-react";
import { useAuth } from "../store/auth";

export default function Maintenance() {
    const { token, user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        category: "Plumbing",
        priority: "Medium",
        description: ""
    });

    // Filters
    const [filter, setFilter] = useState({
        search: "",
        status: "All",
        priority: "All"
    });

    const [properties, setProperties] = useState([]);

    const role = user?.role || "TENANT";

    const fetchProperties = async () => {
        if (role !== "MANAGER") return;
        try {
            const response = await fetch("http://localhost:7000/api/owner/properties", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProperties(data.properties || []);
            }
        } catch (err) {
            console.error("Failed to fetch properties", err);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:7000/api/maintenance/requests", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests);
            } else {
                setError("Failed to fetch requests");
            }
        } catch (err) {
            setError("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchRequests();
            if (role === "MANAGER") fetchProperties();
        }
    }, [token, role]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch("http://localhost:7000/api/maintenance/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowForm(false);
                setFormData({ title: "", category: "Plumbing", priority: "Medium", description: "", propertyId: "" });
                fetchRequests();
            } else {
                alert("Failed to create request");
            }
        } catch (err) {
            alert("Error creating request");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:7000/api/maintenance/request/${requestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchRequests();
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            alert("Error updating status");
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.title.toLowerCase().includes(filter.search.toLowerCase()) ||
            req.unitId?.unitNumber?.toLowerCase().includes(filter.search.toLowerCase());
        const matchesStatus = filter.status === "All" || req.status === filter.status;
        const matchesPriority = filter.priority === "All" || req.priority === filter.priority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "In Progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Cancelled": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "Critical": return "text-rose-500";
            case "High": return "text-orange-500";
            case "Medium": return "text-amber-500";
            case "Low": return "text-emerald-500";
            default: return "text-gray-500";
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
        </div>
    );

    return (
        <div className="p-4 md:p-2 bg-[var(--bg-main)] min-h-screen text-[var(--text-secondary)] font-[var(--font-body)]">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                {/* Page Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            Maintenance Management
                        </h1>
                    </div>
                </div>

                {(role === "TENANT" || role === "MANAGER") && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-[var(--color-primary)]/20 active:scale-95"
                    >
                        <Plus size={20} />
                        New Request
                    </button>
                )}
            </div>

            {/* Quick Stats (Brief) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Requests", value: requests.length, color: "blue" },
                    { label: "Pending", value: requests.filter(r => r.status === "Pending").length, color: "amber" },
                    { label: "In Progress", value: requests.filter(r => r.status === "In Progress").length, color: "blue" },
                    { label: "Completed", value: requests.filter(r => r.status === "Completed").length, color: "emerald" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--color-main)]/30">
                        <p className="text-xs font-bold text-[var(--text-card)] uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--color-main)]/30 shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-card)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title or unit..."
                        className="w-full bg-[var(--bg-main)]/50 border border-[var(--color-main)]/20 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all"
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        className="bg-[var(--bg-main)]/50 border border-[var(--color-main)]/20 rounded-xl px-4 py-3 outline-none text-sm font-medium"
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <select
                        className="bg-[var(--bg-main)]/50 border border-[var(--color-main)]/20 rounded-xl px-4 py-3 outline-none text-sm font-medium"
                        value={filter.priority}
                        onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                    >
                        <option value="All">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
            </div>

            {/* Requests Grid/List */}
            {filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--color-main)]/40">
                    <Eye className="mx-auto text-[var(--text-card)] mb-4" size={48} />
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">No requests found</h3>
                    <p className="text-[var(--text-card)]">Try adjusting your filters or create a new request.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map((req) => (
                        <div key={req._id} className="bg-[var(--bg-card)] hover:bg-[var(--bg-card)]/80 p-5 rounded-2xl border border-[var(--color-main)]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all group">

                            <div className="flex items-start gap-4 flex-1">
                                <div className={`p-3 rounded-xl border ${getStatusStyle(req.status)}`}>
                                    {req.status === "Pending" ? <Clock size={24} /> :
                                        req.status === "In Progress" ? <Clock className="animate-pulse" size={24} /> :
                                            req.status === "Completed" ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{req.title}</h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-card)]">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(req.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><Building2 size={14} /> {req.propertyId?.propertyName || "Common Area"}</span>
                                        <span className="flex items-center gap-1.5"><User size={14} /> Unit: {req.unitId?.unitNumber || "N/A"}</span>
                                        <span className={`font-bold ${getPriorityStyle(req.priority)}`}>• {req.priority} Priority</span>
                                    </div>
                                    <p className="text-sm line-clamp-1 text-[var(--text-card)]/80 mt-2">{req.description}</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--color-main)]/20">
                                <div className="flex items-center gap-3">
                                    {role === "MANAGER" && req.status !== "Completed" && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(req._id, "In Progress")}
                                                className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/30 rounded-lg text-sm font-bold hover:bg-blue-500 hover:text-white transition-all"
                                            >
                                                Start Fixing
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(req._id, "Completed")}
                                                className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-lg text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all"
                                            >
                                                Finish
                                            </button>
                                        </>
                                    )}
                                    <button className="p-2.5 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-card)] transition-colors border border-transparent hover:border-[var(--color-main)]/20">
                                        <Eye size={20} />
                                    </button>
                                </div>
                                <div className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${getStatusStyle(req.status)}`}>
                                    {req.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Request Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
                    <div className="relative bg-[var(--bg-card)] w-full max-w-2xl rounded-3xl border border-[var(--color-main)]/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                                <Send className="text-[var(--color-primary)]" />
                                Submit Maintenance Request
                            </h2>

                            <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-[var(--text-card)] mb-2 uppercase tracking-wide">Issue Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        className="w-full bg-[var(--bg-main)]/50 border border-[var(--color-main)]/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all"
                                        placeholder="e.g., Leaking Kitchen Sink"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {role === "MANAGER" && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-[var(--text-card)] mb-2 uppercase tracking-wide">Select Property</label>
                                        <select
                                            name="propertyId"
                                            required
                                            className="w-full bg-[var(--bg-main)]/50 border border-[var(--color-main)]/20 rounded-xl py-3 px-4 outline-none"
                                            value={formData.propertyId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Choose a property...</option>
                                            {properties.map(p => (
                                                <option key={p._id} value={p._id}>{p.propertyName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-card)] mb-2 uppercase tracking-wide">Category</label>
                                    <select
                                        name="category"
                                        className="w-full bg-[var(--bg-main)]/50 border border-[var(--color-main)]/20 rounded-xl py-3 px-4 outline-none"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                    >
                                        <option>Plumbing</option>
                                        <option>Electrical</option>
                                        <option>Appliance</option>
                                        <option>Structural</option>
                                        <option>HVAC</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-card)] mb-2 uppercase tracking-wide">Priority Level</label>
                                    <select
                                        name="priority"
                                        className="w-full bg-[var(--bg-main)]/50 border border-[var(--color-main)]/20 rounded-xl py-3 px-4 outline-none"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Critical</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-[var(--text-card)] mb-2 uppercase tracking-wide">Description</label>
                                    <textarea
                                        name="description"
                                        required
                                        rows="4"
                                        className="w-full bg-[var(--bg-main)]/50 border border-[var(--color-main)]/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[var(--color-primary)]/50 outline-none transition-all resize-none"
                                        placeholder="Please provide details about the location and nature of the issue..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="md:col-span-2 flex items-center justify-end gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-[var(--text-card)] hover:bg-[var(--bg-main)] transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}