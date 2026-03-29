import React, { useEffect, useState } from "react";
import { UserPlus, Edit, Trash2, X, Search, Mail, Smartphone, ShieldCheck, ChevronDown, User as UserIcon, Loader2, ArrowRight, Shield } from "lucide-react";
import { useAuth } from "../store/auth";
import { useToast } from "../store/ToastContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const initialState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "TENANT",
};

const User = () => {
    const { users, user: currentUser } = useAuth();
    const { toast } = useToast();

    const [userList, setUserList] = useState([]);
    const [formData, setFormData] = useState({
        ...initialState,
        role: ["MANAGER", "OWNER"].includes(currentUser?.role) ? "TENANT" : "TENANT"
    });
    const [openForm, setOpenForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const isEditing = Boolean(editId);

    useEffect(() => {
        if (Array.isArray(users)) {
            if (currentUser?.role === "MANAGER" || currentUser?.role === "OWNER") {
                setUserList(users.filter(u => u.createdBy === currentUser?._id || u.createdBy?._id === currentUser?._id));
            } else {
                setUserList(users);
            }
        }
    }, [users, currentUser]);

    useEffect(() => {
        if (["MANAGER", "OWNER"].includes(currentUser?.role) && !isEditing) {
            setFormData(prev => ({ ...prev, role: "TENANT" }));
        }
    }, [currentUser, isEditing]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                ? `http://localhost:7000/api/admin/user/${editId}`
                : `http://localhost:7000/api/admin/user`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok)
                return toast.error(data.msg || data.message || "Error occurred");

            if (isEditing) {
                setUserList((prev) =>
                    prev.map((u) => (u._id === editId ? data.user : u))
                );
                toast.success("User Updated Successfully");
            } else {
                setUserList((prev) => [...prev, data.newUser]);
                toast.success("User Added Successfully");
            }

            resetForm();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleEdit = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            role: user.role,
            password: "",
        });
        setEditId(user._id);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:7000/api/admin/user/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) return toast.error("Failed to delete user");

            setUserList((prev) => prev.filter((u) => u._id !== id));
            toast.success("User Deleted Successfully");
        } catch {
            toast.error("Something went wrong");
        }
    };

    const filteredUsers = userList.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-secondary)] tracking-tight">
                        User Management
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50 group-focus-within:opacity-100 group-focus-within:text-[var(--color-primary)] transition-all" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-6 text-[13px] font-bold text-[var(--color-secondary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setFormData(initialState);
                            setEditId(null);
                            setOpenForm(true);
                        }}
                        variant="primary"
                        size="md"
                        icon={currentUser?.isDemoAccount ? <Shield size={14} /> : <UserPlus size={14} />}
                        className="w-full sm:w-auto cursor-pointer"
                        disabled={currentUser?.isDemoAccount}
                    >
                        {currentUser?.isDemoAccount ? "READ ONLY MODE" : "ADD USER"}
                    </Button>
                </div>
            </header>

            {/* Content Area */}
            <section className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                {/* Desktop view */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Serial</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Participant Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Authorization Level</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user, index) => (
                                <tr key={user._id} className={`hover:bg-gray-50/50 transition-all group border-l-4 border-l-transparent hover:border-l-[var(--color-primary)] ${user.isBlocked ? "opacity-40 grayscale" : ""}`}>
                                    <td className="px-8 py-7">
                                        <span className="text-[11px] font-black text-[var(--text-muted)] opacity-40">#{String(index + 1).padStart(4, '0')}</span>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center text-xs font-black text-[var(--color-secondary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all shadow-sm">
                                                {user.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-[var(--color-secondary)] truncate max-w-[200px]">{user.name}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] opacity-60"><Mail size={10} /> {user.email}</span>
                                                    {user.phone && <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] opacity-60"><Smartphone size={10} /> {user.phone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100 text-[var(--color-secondary)] bg-white shadow-sm">
                                            <ShieldCheck size={10} className="text-indigo-500" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7 text-center">
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.isBlocked ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            user.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                "bg-amber-50 text-amber-600 border-amber-100"
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.isBlocked ? "bg-rose-500" : user.isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                                            {user.isBlocked ? "Blocked" : user.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button onClick={() => handleEdit(user)} iconOnly variant="secondary" size="xs" icon={<Edit size={16} />} title={currentUser?.isDemoAccount ? "View Only" : "Modify Record"} className="cursor-pointer" disabled={currentUser?.isDemoAccount} />
                                            <Button onClick={() => handleDelete(user._id)} iconOnly variant="secondary" size="xs" icon={<Trash2 size={16} />} title={currentUser?.isDemoAccount ? "Delete Disabled" : "Delete Identity"} className={`text-rose-300 hover:text-rose-600 hover:border-rose-100 cursor-pointer ${currentUser?.isDemoAccount ? "opacity-20" : ""}`} disabled={currentUser?.isDemoAccount} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet View */}
                <div className="lg:hidden p-4 space-y-4 bg-gray-50/50 rounded-b-[2rem]">
                    {filteredUsers.map((user) => (
                        <div key={user._id} className={`group p-6 bg-white border border-gray-100 rounded-[2.5rem] space-y-5 shadow-md hover:shadow-xl transition-all relative overflow-hidden ${user.isBlocked ? "grayscale opacity-50" : ""}`}>
                            {/* Status Accent Bar */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${user.isBlocked ? 'bg-gray-400' : user.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                            <div className="flex justify-between items-start pl-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg group-hover:scale-110 transition-transform">
                                        {user.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-[var(--color-secondary)] text-base tracking-tight">{user.name}</p>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-0.5">{user.role}</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${user.isBlocked ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    user.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                                    }`}>
                                    {user.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 ml-2">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Identity Handle</p>
                                    <p className="text-xs font-bold text-[var(--color-secondary)] truncate">@{user.email.split('@')[0]}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Contact Stream</p>
                                    <p className="text-xs font-bold text-[var(--color-secondary)]">{user.phone || 'No Data'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2 pl-2">
                                <Button onClick={() => handleEdit(user)} variant="secondary" size="md" className="flex-1 cursor-pointer font-black text-[10px] tracking-widest uppercase" icon={<Edit size={14} />} disabled={currentUser?.isDemoAccount}>
                                    {currentUser?.isDemoAccount ? "View" : "Update"}
                                </Button>
                                <Button onClick={() => handleDelete(user._id)} variant="primary" size="md" className="flex-1 cursor-pointer font-black text-[10px] tracking-widest uppercase" icon={<Trash2 size={14} />} disabled={currentUser?.isDemoAccount}>
                                    {currentUser?.isDemoAccount ? "Locked" : "Delete"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Identity Modal */}
            {openForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={resetForm}></div>

                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] sm:rounded-[3.5rem] border border-gray-100 shadow-lg overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="px-6 sm:px-10 pt-6 pb-4 border-b border-gray-50 flex items-center justify-between shrink-0">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-black text-[var(--color-secondary)] tracking-tight">
                                    {isEditing ? "Edit User" : "New User"}
                                </h3>
                            </div>
                            <Button onClick={resetForm} iconOnly variant="secondary" size="sm" icon={<X size={20} />} className="hover:bg-rose-50 hover:text-rose-600 cursor-pointer" />
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-6">
                                <Input
                                    label="Name"
                                    type="text"
                                    name="name"
                                    required
                                    variant="formInput"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    required
                                    variant="formInput"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        label="Password"
                                        type="password"
                                        name="password"
                                        variant="formInput"
                                        placeholder={isEditing ? "Leave blank to keep" : "Password"}
                                        required={!isEditing}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full"
                                    />
                                    <Input
                                        label="Phone"
                                        type="tel"
                                        name="phone"
                                        variant="formInput"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[var(--text-secondary)] text-sm font-semibold">Role</label>
                                    <div className="relative">
                                        <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 pl-10 border border-gray-100 focus:border-[var(--color-primary)]/40 text-[var(--text-secondary)] rounded-xl outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-md appearance-none cursor-pointer text-sm font-semibold"
                                            disabled={["MANAGER", "OWNER"].includes(currentUser?.role) && isEditing}
                                        >
                                            {currentUser?.role === "MANAGER" && <option value="TENANT">Tenant</option>}
                                            {currentUser?.role === "OWNER" && (
                                                <>
                                                    <option value="MANAGER">Manager</option>
                                                    <option value="TENANT">Tenant</option>
                                                </>
                                            )}
                                            {currentUser?.role === "SUPER_ADMIN" && (
                                                <>
                                                    <option value="TENANT">Tenant</option>
                                                    <option value="OWNER">Owner</option>
                                                    <option value="MANAGER">Manager</option>
                                                    <option value="MAINTENANCE_STAFF">Maintenance</option>
                                                    <option value="SUPER_ADMIN">Admin</option>
                                                </>
                                            )}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none opacity-40" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" htmlType="submit" variant="primary" size="lg" className="min-w-[170px] cursor-pointer">
                                    {isEditing ? "UPDATE USER" : "ADD USER"}
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

export default User;
