import React, { useEffect, useState } from "react";
import { UserPlus, Edit, Trash2, X } from "lucide-react";
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

    const isEditing = Boolean(editId);

    useEffect(() => {
        if (Array.isArray(users)) {
            if (currentUser?.role === "MANAGER" || currentUser?.role === "OWNER") {
                // Filter users to only show those created by the current manager/owner 
                // and where their role is appropriate (Tenants for Managers, Manager/Tenant for Owners)
                setUserList(users.filter(u => u.createdBy === currentUser?._id || u.createdBy?._id === currentUser?._id));
            } else {
                setUserList(users);
            }
        }
    }, [users, currentUser]);

    // Update role if currentUser is Manager or Owner
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

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Page Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            User Management
                        </h1>
                    </div>
                </div>

                <Button onClick={() => {
                    setFormData(initialState);
                    setEditId(null);
                    setOpenForm(true);
                }}>
                    <UserPlus size={20} />
                    <span className="font-medium">Add User</span>
                </Button>
            </div>

            {/* User Table / Cards */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-card)] shadow-sm overflow-hidden">
                {/* Desktop/Tablet view */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--color-card)] bg-[var(--color-card)]/50">
                                <th className="p-4 font-bold text-[var(--text-secondary)]">#</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)]">Name</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)]">Email</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)]">Phone</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)]">Role</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)]">Status</th>
                                <th className="p-4 font-bold text-[var(--text-secondary)] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(userList) && userList.map((user, index) => (
                                <tr key={user._id} className={`border-b border-[var(--color-card)] hover:bg-[var(--color-card)]/30 transition-colors ${!user.isActive ? "opacity-60 grayscale" : ""}`}>
                                    <td className="p-4 text-[var(--text-card)]">{index + 1}</td>
                                    <td className="p-4 font-medium text-[var(--text-secondary)]">{user.name}</td>
                                    <td className="p-4 text-[var(--text-card)]">{user.email}</td>
                                    <td className="p-4 text-[var(--text-card)]">{user.phone || "—"}</td>
                                    <td className="p-4 text-[var(--text-card)]">
                                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border border-[var(--color-card)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-[var(--text-card)]">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${user.isBlocked
                                            ? "bg-red-500/20 text-red-400"
                                            : user.isActive
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                            {user.isBlocked ? "Blocked" : user.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-4">
                    {Array.isArray(userList) && userList.map((user, index) => (
                        <div key={user._id} className={`p-4 space-y-4 bg-[var(--color-card)]/10 border border-[var(--color-card)] hover:bg-[var(--color-card)]/20 transition-colors rounded-xl shadow-sm ${!user.isActive ? "opacity-60 grayscale" : ""}`}>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white text-lg">{user.name}</h4>
                                    <p className="text-sm text-[var(--text-card)]">{user.email}</p>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${user.isBlocked
                                    ? "bg-red-500/20 text-red-400"
                                    : user.isActive
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                    }`}>
                                    {user.isBlocked ? "Blocked" : user.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">Phone</p>
                                    <p className="text-sm text-[var(--text-secondary)]">{user.phone || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-card)]">Role</p>
                                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border border-[var(--color-card)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => handleEdit(user)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-bold transition-all active:scale-95"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(user._id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold transition-all active:scale-95"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {openForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-[var(--bg-card)] w-full max-w-md p-6 rounded-2xl border border-[var(--color-card)] shadow-xl relative">

                        {/* Close Button */}
                        <button
                            onClick={resetForm}
                            className="absolute top-4 right-4 text-[var(--text-card)] hover:text-[var(--color-primary)]"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-[var(--text-secondary)] mb-6">
                            {isEditing ? "Update User" : "Add New User"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Input
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter name"
                                    variant='formInput'
                                    className='text-sm'
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    variant='formInput'
                                    className='text-sm'
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
                                    variant='formInput'
                                    className='text-sm'
                                    required={!isEditing}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    variant='formInput'
                                    className='text-sm'
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className={`w-full bg-[var(--bg-card)] border border-[var(--color-card)] rounded-lg px-4 py-2.5 text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition ${["MANAGER", "OWNER"].includes(currentUser?.role) && isEditing ? "opacity-70 cursor-not-allowed" : ""}`}
                                    required
                                    disabled={["MANAGER", "OWNER"].includes(currentUser?.role) && isEditing}
                                >
                                    {currentUser?.role === "MANAGER" && (
                                        <option value="TENANT">Tenant</option>
                                    )}
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
                                            <option value="MAINTENANCE_STAFF">Maintenance Staff</option>
                                            <option value="SUPER_ADMIN">Super Admin</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <Button type="primary" className="w-full" htmlType="submit">
                                {isEditing ? "Update User" : "Save User"}
                            </Button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default User;
