import React, { useState } from "react";
import { Search, Mail, Bell, User, ChevronDown, Menu, Layers, Clock, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";
import { BASE_URL } from "../store/api.jsx";
import Button from "../components/ui/Button";

const Header = ({ onToggleSidebar }) => {
    const [openAccount, setOpenAccount] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [totalActive, setTotalActive] = useState(0);
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/maintenance/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                let filtered = [];

                if (user?.role === "TENANT") {
                    // For tenants: Show requests that have status updates (Ongoing or Finished)
                    filtered = data.requests.filter(req => req.status !== "Pending");
                } else if (user?.role === "MANAGER" || user?.role === "OWNER") {
                    // For managers/owners: Show received requests (where someone else created it)
                    filtered = data.requests.filter(req => req.createdBy?._id !== user?._id);
                } else {
                    // Fallback for other roles (Super Admin)
                    filtered = data.requests;
                }

                // Sort by updatedAt if available, otherwise createdAt
                const sorted = filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

                setNotifications(sorted.slice(0, 3));
                setTotalActive(filtered.length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    React.useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    const handleBellHover = () => {
        setOpenNotifications(true);
        fetchNotifications(); // Refresh on hover
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "In Progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "Cancelled": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
        }
    };

    return (
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-10 py-5 flex items-center justify-between sticky top-0 z-30 font-['Inter']">

            {/* LEFT SIDE — Hamburger + Search */}
            <div className="flex items-center gap-4 flex-1">
                {/* Hamburger Menu (Mobile Only) */}
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    icon={<Menu size={22} />}
                    onClick={onToggleSidebar}
                    className="lg:hidden text-[var(--text-muted)]"
                />

                {/* 🔍 SEARCH */}
                <div className="relative w-full max-w-xs md:max-w-sm ml-2 group">
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors"
                    />
                    <input
                        type="text"
                        placeholder="Search for everything..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-transparent bg-gray-50/50 text-[var(--color-secondary)] text-[13px] font-bold placeholder:text-[var(--text-muted)] placeholder:font-medium focus:outline-none focus:bg-white focus:border-[var(--color-primary)]/20 focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all"
                    />
                </div>
            </div>


            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4 md:gap-6 ml-4">
                {/* Notifications */}
                {user?.role !== "SUPER_ADMIN" && (
                    <div
                        className="relative"
                        onMouseEnter={handleBellHover}
                        onMouseLeave={() => setOpenNotifications(false)}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            icon={
                                <div className="relative">
                                    <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                                    {totalActive > 0 && (
                                        <span className="absolute h-2 w-2 top-0 right-0 bg-[#e74c3c] rounded-full ring-2 ring-white"></span>
                                    )}
                                </div>
                            }
                            className="text-[var(--text-muted)] hover:text-[var(--color-primary)]"
                        />

                        {/* Notification Dropdown Container */}
                        {openNotifications && (
                            <div className="absolute right-0 top-full pt-2 z-50">
                                <div
                                    className="w-[90vw] sm:w-80 max-w-sm bg-white border border-gray-100 rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                                >
                                    {/* Header */}
                                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                                        <h3 className="text-[var(--color-secondary)] font-black text-xs tracking-widest uppercase">
                                            {user?.role === "TENANT" ? "Status Updates" : "Requests"}
                                        </h3>
                                        <div className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black italic">
                                            LATEST ONLY
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            <div className="divide-y divide-gray-50">
                                                {notifications.map((req) => (
                                                    <NavLink
                                                        key={req._id}
                                                        to="/maintenance"
                                                        className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col gap-2.5 block group/item"
                                                        onClick={() => setOpenNotifications(false)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-[var(--color-secondary)] text-[13px] font-black truncate pr-2 group-hover/item:text-[var(--color-primary)] transition-colors">
                                                                {req.title}
                                                            </span>
                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getStatusStyle(req.status)} uppercase font-black tracking-widest`}>
                                                                {req.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[var(--text-muted)] text-[11px] line-clamp-2 font-medium leading-relaxed italic opacity-80">
                                                            {req.description}
                                                        </p>
                                                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5 opacity-60">
                                                                <Clock size={11} /> {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <span className={req.priority === "Critical" ? "text-rose-500" : "text-amber-500"}>
                                                                • {req.priority}
                                                            </span>
                                                        </div>
                                                    </NavLink>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-10 text-center">
                                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                    <Bell size={20} className="text-gray-300" />
                                                </div>
                                                <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest opacity-40">
                                                    All catch up
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <NavLink
                                        to="/maintenance"
                                        onClick={() => setOpenNotifications(false)}
                                        className="p-4 text-center text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all border-t border-gray-50 block"
                                    >
                                        Manage Activities
                                    </NavLink>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Account Dropdown */}
                <div
                    className="relative"
                    onMouseEnter={() => setOpenAccount(true)}
                    onMouseLeave={() => setOpenAccount(false)}
                >
                    <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-2xl hover:bg-gray-50/80 border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                        <div className="flex flex-col items-end mr-2 hidden sm:flex">
                            <span className="text-[13px] font-black text-[var(--color-secondary)] leading-none">{user?.name?.split(' ')[0]}</span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5 opacity-60">{user?.role}</span>
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 text-[var(--color-primary)] shadow-sm group-hover:shadow-[var(--color-primary)]/10 transition-all">
                            <User size={18} />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {openAccount && (
                        <div className="absolute right-0 top-full pt-2 z-50">
                            <div className="w-[90vw] sm:w-72 max-w-sm bg-white border border-gray-100 rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] p-2 transition-all duration-200 ease-out">
                                <div className="p-4 mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#e74c3c] text-white shadow-lg shadow-[var(--color-primary)]/20 font-black text-xl">
                                            {user?.name?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[var(--color-secondary)] font-black text-base truncate">
                                                {user.name}
                                            </span>
                                            <span className="text-[var(--text-muted)] text-xs font-bold truncate opacity-70">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <NavLink to="/profile" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group">
                                        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                            <Layers size={18} className="text-[var(--color-primary)]" />
                                        </div>
                                        <div>
                                            <div className="text-[var(--color-secondary)] text-sm font-bold">My Profile</div>
                                            <div className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider opacity-60">Account Settings</div>
                                        </div>
                                    </NavLink>
                                </div>

                                <div className="mt-2 p-2 pt-2 border-t border-gray-50">
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        className="w-full flex items-center justify-center gap-2 "
                                        onClick={() => navigate("/logout")}
                                        icon={<LogOut size={16} />}
                                    >
                                        LOGOUT
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;
