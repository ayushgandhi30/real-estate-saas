import React, { useState, useEffect } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../store/ToastContext";
import { 
    Plus, 
    Edit, 
    Trash2, 
    X, 
    Shield, 
    Users, 
    Database, 
    LayoutGrid, 
    Search, 
    Layers,
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    ShieldAlert,
    MoreVertical,
    Loader2
} from "lucide-react";
import { useAuth } from "../store/auth";

const initialState = {
    name: "",
    priceMonthly: "",
    priceYearly: "",
    propertyLimit: "",
    unitLimit: "",
    managerLimit: "",
    storageLimitMB: 500,
    trialDays: 0,
    isActive: true
};

const Subscriptions = () => {
    const { user } = useAuth();
    const isDemo = user?.isDemoAccount;
    const { toast } = useToast();
    const [openForm, setOpenForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState(initialState);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const isEditing = Boolean(editId);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:7000/api/admin/plans", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setPlans(data.data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData(initialState);
        setEditId(null);
        setOpenForm(false);
    };

    const handleEdit = (plan) => {
        setFormData({
            name: plan.name,
            priceMonthly: plan.priceMonthly,
            priceYearly: plan.priceYearly,
            propertyLimit: plan.propertyLimit,
            unitLimit: plan.unitLimit,
            managerLimit: plan.managerLimit,
            storageLimitMB: plan.storageLimitMB,
            trialDays: plan.trialDays,
            isActive: plan.isActive
        });
        setEditId(plan._id);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subscription plan?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:7000/api/admin/plan/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                toast.success("Plan deleted successfully");
                fetchPlans();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to delete plan");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const url = isEditing
                ? `http://localhost:7000/api/admin/plan/${editId}`
                : "http://localhost:7000/api/admin/plan";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(isEditing ? "Plan Updated Successfully" : "Plan Added Successfully");
                resetForm();
                fetchPlans();
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        }
    };

    const filteredPlans = plans.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-8 space-y-8 font-['Inter']">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[var(--color-secondary)] tracking-tight">
                        Subscription Models
                    </h1>
                    <p className="text-[var(--text-muted)] font-medium text-sm">Define tier-based access controls, pricing frameworks, and service boundaries.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                     <div className="relative group w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 group-focus-within:opacity-100 transition-all font-bold" size={16} />
                        <input
                            type="text"
                            placeholder="Filter tiers..."
                            className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-[13px] font-bold text-[var(--color-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button 
                        onClick={() => { resetForm(); setOpenForm(true); }}
                        variant="primary"
                        size="md"
                        disabled={isDemo}
                        icon={isDemo ? <Shield size={18} /> : <Plus size={18} />}
                    >
                        {isDemo ? "READ ONLY" : "CREATE NEW TIER"}
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 space-y-4">
                    <Loader2 className="animate-spin text-[var(--color-primary)]" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Synchronizing Service Tiers...</p>
                </div>
            ) : filteredPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPlans.map((plan) => (
                        <div key={plan._id} className="premium-card p-0 rounded-[3rem] bg-white border border-gray-100 group overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2">
                            
                            {/* Card Header Area */}
                            <div className="p-8 pb-4 relative">
                                <div className="absolute top-0 right-0 p-8 text-[var(--color-primary)] opacity-5 transform group-hover:rotate-12 transition-transform duration-700">
                                    <Layers size={100} />
                                </div>
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                        plan.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${plan.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                        {plan.isActive ? 'Live' : 'Inactive'}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            onClick={() => handleEdit(plan)} 
                                            variant="secondary" 
                                            size="xs" 
                                            iconOnly 
                                            icon={<Edit size={16} />} 
                                            disabled={isDemo}
                                            title={isDemo ? "Locked" : "Modify Tier"}
                                        />
                                        <Button 
                                            onClick={() => handleDelete(plan._id)} 
                                            variant="danger" 
                                            size="xs" 
                                            iconOnly 
                                            icon={<Trash2 size={16} />} 
                                            disabled={isDemo}
                                            title={isDemo ? "Locked" : "Delete Tier"}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <h4 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight group-hover:text-[var(--color-primary)] transition-colors">{plan.name}</h4>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-40">Tier Specification ID: #{plan._id.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>

                            {/* Pricing Framework */}
                            <div className="px-8 py-8 bg-gray-50/50 border-y border-gray-50/80">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-[var(--color-secondary)]">₹{plan.priceMonthly.toLocaleString()}</span>
                                    <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">/ Mensum</span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 w-fit shadow-sm">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                        ALC: ₹{plan.priceYearly.toLocaleString()} Annually
                                    </span>
                                </div>
                            </div>

                            {/* Logic Barriers/Limits */}
                            <div className="p-8 space-y-5 flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                                            <LayoutGrid size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-[var(--text-muted)]">Assets Framework</span>
                                    </div>
                                    <span className="text-xs font-black text-[var(--color-secondary)] uppercase">{plan.propertyLimit} Properties</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
                                            <Layers size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-[var(--text-muted)]">Inventory Capacity</span>
                                    </div>
                                    <span className="text-xs font-black text-[var(--color-secondary)] uppercase">{plan.unitLimit} Units Total</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                                            <Users size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-[var(--text-muted)]">Administrative Access</span>
                                    </div>
                                    <span className="text-xs font-black text-[var(--color-secondary)] uppercase">{plan.managerLimit} Managers</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                            <Database size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-[var(--text-muted)]">Secure Vault</span>
                                    </div>
                                    <span className="text-xs font-black text-[var(--color-secondary)] uppercase">{plan.storageLimitMB} MB Volume</span>
                                </div>
                            </div>

                            {/* Trial Provision */}
                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-[var(--text-muted)] opacity-30" />
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                        Trial Provision
                                    </span>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${plan.trialDays > 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' : 'bg-gray-200 text-gray-400'}`}>
                                    {plan.trialDays > 0 ? `${plan.trialDays} DIMENSIONS` : "NOT APPLICABLE"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 py-40 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 mb-8 border border-gray-100 shadow-sm">
                        <ShieldAlert size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight uppercase">Operational Vacuum</h3>
                        <p className="text-[var(--text-muted)] text-sm font-medium max-w-xs mx-auto">No subscription models have been established in the core engine yet.</p>
                    </div>
                    <Button 
                        onClick={() => { resetForm(); setOpenForm(true); }} 
                        variant="primary"
                        size="md"
                        className="mt-10"
                    >
                        ESTABLISH FIRST TIER
                    </Button>
                </div>
            )}

            {/* Modal Tier Constructor */}
            {openForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={resetForm}></div>

                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] border border-gray-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
                        
                        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-white relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight">
                                    {isEditing ? "Modify Subscription Tier" : "Tier Constructor"}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Configure access barriers and fiscal yields</p>
                            </div>
                            <Button variant="secondary" size="sm" iconOnly icon={<X size={24} />} onClick={resetForm} />
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 pt-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar relative z-10">
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-1">TIER IDENTIFIER</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g. Enterprise Framework"
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[var(--color-primary)]/20 rounded-2xl px-6 py-4 text-[13px] font-bold text-[var(--color-secondary)] placeholder-[var(--text-muted)] transition-all focus:outline-none"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-1">MONTHLY YIELD (₹)</label>
                                    <input
                                        type="number"
                                        name="priceMonthly"
                                        required
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[var(--color-primary)]/20 rounded-2xl px-6 py-4 text-[13px] font-black text-[var(--color-secondary)] transition-all focus:outline-none"
                                        value={formData.priceMonthly}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-1">ANNUAL COMMITMENT (₹)</label>
                                    <input
                                        type="number"
                                        name="priceYearly"
                                        required
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[var(--color-primary)]/20 rounded-2xl px-6 py-4 text-[13px] font-black text-[var(--color-secondary)] transition-all focus:outline-none"
                                        value={formData.priceYearly}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 space-y-8">
                                <p className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest text-center">Service Boundaries</p>
                                
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center block">Assets</label>
                                        <input type="number" name="propertyLimit" required className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black text-center text-[var(--color-secondary)] focus:outline-none focus:border-[var(--color-primary)]/20" value={formData.propertyLimit} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center block">Units</label>
                                        <input type="number" name="unitLimit" required className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black text-center text-[var(--color-secondary)] focus:outline-none focus:border-[var(--color-primary)]/20" value={formData.unitLimit} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center block">Access</label>
                                        <input type="number" name="managerLimit" required className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black text-center text-[var(--color-secondary)] focus:outline-none focus:border-[var(--color-primary)]/20" value={formData.managerLimit} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center block">Vault (MB)</label>
                                        <input type="number" name="storageLimitMB" required className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black text-center text-[var(--color-secondary)] focus:outline-none focus:border-[var(--color-primary)]/20" value={formData.storageLimitMB} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center block">Trial Period</label>
                                        <input type="number" name="trialDays" required className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-black text-center text-[var(--color-secondary)] focus:outline-none focus:border-[var(--color-primary)]/20" value={formData.trialDays} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-gray-900/5 p-6 rounded-[2rem] border border-gray-100">
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                </div>
                                <div>
                                    <label htmlFor="isActive" className="text-[11px] font-black text-[var(--color-secondary)] uppercase tracking-widest cursor-pointer">Immediate Activation</label>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase opacity-60">Authorize tier for production scaling</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-6 pt-6">
                                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Discard Draft</Button>
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    size="md"
                                    icon={isEditing ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                                >
                                    {isEditing ? "Update Specification" : "Issue Operational Tier"}
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
            `}</style>
        </div>
    );
};

export default Subscriptions;
