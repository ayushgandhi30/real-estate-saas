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
    ArrowRight,
    X,
    MessageSquare,
    AlertCircle,
    ChevronDown
} from "lucide-react";
import { useAuth } from "../store/auth";
import { useToast } from "../store/ToastContext";
import Button from "../components/ui/Button";

export default function Maintenance() {
    const { token, user } = useAuth();
    const { toast } = useToast();
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
        description: "",
        propertyId: ""
    });

    // Filters
    const [filter, setFilter] = useState({
        search: "",
        status: "All",
        priority: "All"
    });

    const [properties, setProperties] = useState([]);

    const role = user?.role;
    const isAuthorizedToCreate = ["TENANT", "MANAGER", "OWNER"].includes(role);
    const isPropertySelectRequired = ["MANAGER", "OWNER"].includes(role);

    const fetchProperties = async () => {
        if (!isPropertySelectRequired) return;
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
            if (isPropertySelectRequired) fetchProperties();
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
                toast.success("Maintenance request submitted successfully");
                setShowForm(false);
                setFormData({ title: "", category: "Plumbing", priority: "Medium", description: "", propertyId: "" });
                fetchRequests();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to create request");
            }
        } catch (err) {
            toast.error("Error connecting to server");
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
                toast.success("Status updated successfully");
                fetchRequests();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to update status");
            }
        } catch (err) {
            toast.error("Error updating status");
        }
    };

    const [activeTab, setActiveTab] = useState("Received");

    const filteredRequests = requests.filter(req => {
        const titleMatch = req.title?.toLowerCase().includes(filter.search.toLowerCase());
        const unitMatch = req.unitId?.unitNumber?.toLowerCase().includes(filter.search.toLowerCase()) || false;

        const matchesSearch = titleMatch || unitMatch;
        const matchesStatus = filter.status === "All" || req.status === filter.status;
        const matchesPriority = filter.priority === "All" || req.priority === filter.priority;

        let matchesTab = true;
        if (role === "MANAGER") {
            if (activeTab === "Sent") {
                matchesTab = req.createdBy?._id === user?._id;
            } else {
                matchesTab = req.createdBy?._id !== user?._id;
            }
        }

        return matchesSearch && matchesStatus && matchesPriority && matchesTab;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending": return "bg-amber-50 text-amber-600 border-amber-100";
            case "In Progress": return "bg-blue-50 text-blue-600 border-blue-100";
            case "Completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "Cancelled": return "bg-gray-100 text-gray-400 border-gray-200";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case "Critical": return "bg-rose-50 text-rose-600 border-rose-100";
            case "High": return "bg-orange-50 text-orange-600 border-orange-100";
            case "Medium": return "bg-blue-50 text-blue-600 border-blue-100";
            case "Low": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-main)]">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[var(--color-secondary)] tracking-tight">
                        Maintenance Request
                    </h1>
                </div>

                {isAuthorizedToCreate && (
                    <Button
                        onClick={() => setShowForm(true)}
                        variant="primary"
                        size="md"
                    >
                        NEW REQUEST
                    </Button>
                )}
            </header>

            {/* Manager Tabs */}
            {role === "MANAGER" && (
                <div className="flex gap-8 border-b border-gray-100">
                    {["Received", "Sent"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? "text-[var(--color-primary)] opacity-100" : "text-[var(--text-muted)] opacity-40 hover:opacity-100"
                                }`}
                        >
                            {tab} REQUESTS
                            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--color-primary)] rounded-full shadow-[0_4px_10px_rgba(231,76,60,0.3)]"></div>}
                        </button>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--color-primary)] transition-all" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, unit or context..."
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold text-[var(--color-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-sm"
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <select
                            className="bg-white border border-gray-100 rounded-2xl px-6 py-3 text-[13px] font-black text-[var(--color-secondary)] uppercase tracking-wider focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/40 transition-all cursor-pointer shadow-sm hover:shadow-md focus:shadow-md pr-12 appearance-none"
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">Working</option>
                            <option value="Completed">Resolved</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            className="bg-white border border-gray-100 rounded-2xl px-6 py-3 text-[13px] font-black text-[var(--color-secondary)] uppercase tracking-wider focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/40 transition-all cursor-pointer shadow-sm hover:shadow-md focus:shadow-md pr-12 appearance-none"
                            value={filter.priority}
                            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                        >
                            <option value="All">Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Requests Area */}
            {filteredRequests.length === 0 ? (
                <div className="py-32 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-200 mb-6 border border-gray-100 shadow-sm">
                        <MessageSquare size={32} />
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-secondary)] uppercase tracking-tight">Pure Operational Status</h3>
                    <p className="text-[var(--text-muted)] text-sm font-medium mt-2 max-w-xs">No maintenance tickets matching your filters found.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredRequests.map((req) => (
                        <div key={req._id} className="premium-card p-0 rounded-[2.5rem] group overflow-hidden border border-gray-100">
                            <div className="p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 bg-white transition-all group-hover:bg-gray-50/30">

                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getPriorityStyle(req.priority)} shadow-sm`}>
                                            {req.priority} Priority
                                        </span>
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full opacity-60">
                                            {req.category}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-[var(--color-secondary)] group-hover:text-[var(--color-primary)] transition-colors tracking-tight line-clamp-1">{req.title}</h4>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-[var(--text-muted)]">
                                            <span className="flex items-center gap-2"><Calendar size={14} className="opacity-40" /> {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="flex items-center gap-2"><Building2 size={14} className="opacity-40" /> {req.propertyId?.propertyName || "Common Infrastructure"}</span>
                                            <span className="flex items-center gap-2"><User size={14} className="opacity-40" /> {req.createdBy?.name || "Resident Account"}</span>
                                        </div>
                                    </div>

                                    <p className="text-[13px] text-[var(--text-muted)]/80 leading-relaxed font-medium line-clamp-2 max-w-3xl pt-2">{req.description}</p>
                                </div>

                                <div className="flex flex-col lg:items-end gap-5 w-full lg:w-auto pt-6 lg:pt-0 lg:pl-10 lg:border-l border-gray-100">
                                    <div className="flex items-center gap-2">
                                        {req.status !== "Completed" && (
                                            <>
                                                {(role === "OWNER" || (role === "MANAGER" && activeTab === "Received")) && (
                                                    <div className="flex gap-2">
                                                        {req.status === "Pending" && (
                                                            <Button onClick={() => handleUpdateStatus(req._id, "In Progress")} variant="primary" size="sm" className="bg-gray-900 border-gray-900">
                                                                In Progress
                                                            </Button>
                                                        )}
                                                        <Button onClick={() => handleUpdateStatus(req._id, "Completed")} variant="primary" size="sm" className="bg-emerald-600 border-emerald-600 hover:bg-emerald-700">
                                                            Completed
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className={`inline-flex self-start lg:self-auto items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${getStatusStyle(req.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${req.status === 'Completed' ? 'bg-emerald-500' : 'bg-current'}`}></span>
                                        {req.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Request Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowForm(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] border border-gray-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
                        <div className="px-10 pt-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight">New Request</h2>
                            </div>
                            <Button onClick={() => setShowForm(false)} iconOnly variant="secondary" size="xs" icon={<X size={20} />} className="hover:bg-rose-50 hover:text-rose-600" />
                        </div>

                        <form onSubmit={handleCreateRequest} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-1">Issue Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[var(--color-primary)]/20 rounded-2xl px-6 py-4 text-[13px] font-bold text-[var(--color-secondary)] transition-all focus:outline-none"
                                        placeholder="e.g., Critical HVAC System Leak"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {isPropertySelectRequired && (
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-1">Property</label>
                                        <div className="relative">
                                            <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" />
                                            <select
                                                name="propertyId"
                                                required
                                                className="w-full bg-white border border-gray-100 focus:border-[var(--color-primary)]/40 rounded-2xl pl-12 pr-12 py-4 text-[13px] font-bold text-[var(--color-secondary)] transition-all shadow-sm hover:shadow-md focus:shadow-md appearance-none cursor-pointer"
                                                value={formData.propertyId}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Property...</option>
                                                {properties.map(p => (
                                                    <option key={p._id} value={p._id}>{p.propertyName}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-1">Category</label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                className="w-full bg-white border border-gray-100 focus:border-[var(--color-primary)]/40 rounded-2xl px-6 py-4 text-[13px] font-bold text-[var(--color-secondary)] transition-all shadow-sm hover:shadow-md focus:shadow-md appearance-none cursor-pointer"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                            >
                                                <option>Plumbing</option>
                                                <option>Electrical</option>
                                                <option>Appliance</option>
                                                <option>Structural</option>
                                                <option>HVAC</option>
                                                <option>Exteriors</option>
                                                <option>Other</option>
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] pointer-events-none opacity-40" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-1">Priority</label>
                                        <div className="relative">
                                            <select
                                                name="priority"
                                                className="w-full bg-white border border-gray-100 focus:border-[var(--color-primary)]/40 rounded-2xl px-6 py-4 text-[13px] font-bold text-[var(--color-secondary)] transition-all shadow-sm hover:shadow-md focus:shadow-md appearance-none cursor-pointer"
                                                value={formData.priority}
                                                onChange={handleInputChange}
                                            >
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                                <option>Critical</option>
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] pointer-events-none opacity-40" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[12px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        name="description"
                                        required
                                        rows="4"
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[var(--color-primary)]/20 rounded-2xl px-6 py-4 text-[13px] font-bold text-[var(--color-secondary)] transition-all focus:outline-none resize-none"
                                        placeholder="Please provide specific details about the issue location and visible symptoms..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-5">
                                <Button type="button" htmlType="submit" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit" htmlType="submit" loading={submitting} variant="primary" size="lg">
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}