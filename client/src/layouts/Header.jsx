import React, { useState } from "react";
import { Search, Mail, Bell, User, ChevronDown, Menu, Layers, Clock } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";



const Header = ({ onToggleSidebar }) => {
    const [openAccount, setOpenAccount] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [totalActive, setTotalActive] = useState(0);
    const { user, token } = useAuth();

    const fetchNotifications = async () => {
        try {
            const response = await fetch("http://localhost:7000/api/maintenance/requests", {
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
        <header className="w-full bg-[var(--bg-card)] border-b border-[var(--color-card)] px-4 md:px-8 py-4 flex items-center justify-between">

            {/* LEFT SIDE — Hamburger + Search */}
            <div className="flex items-center gap-4 flex-1">
                {/* Hamburger Menu (Mobile Only) */}
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-card)] transition-colors"
                >
                    <Menu size={24} className="text-[var(--text-secondary)]" />
                </button>



                {/* 🔍 SEARCH */}
                <div className="relative w-full max-w-xs md:max-w-sm ml-2">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-card)]"
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                    />
                </div>
            </div>


            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4 md:gap-6 ml-4">
                {/* Notifications */}
                <div
                    className="relative"
                    onMouseEnter={handleBellHover}
                    onMouseLeave={() => setOpenNotifications(false)}
                >
                    <button
                        className="relative p-2 rounded-xl hover:bg-[var(--color-card)] transition-all"
                    >
                        <Bell size={20} className="text-[var(--text-secondary)]" />
                        {totalActive > 0 && (
                            <span className="absolute h-3 w-3 top-1 right-1 bg-[var(--color-primary)] text-[var(--text-secondary)] text-[10px] px-1.5 py-0.5 rounded-full font-bold ">
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown Container */}
                    {openNotifications && (
                        <div className="absolute right-0 top-full pt-2 z-50">
                            <div
                                className="w-[90vw] sm:w-80 max-w-sm bg-[var(--bg-main)] border border-[var(--color-main)] rounded-2xl shadow-2xl flex flex-col overflow-hidden shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200"
                            >
                                {/* Header */}
                                <div className="p-4 border-b border-[var(--color-main)]/30 flex items-center justify-between bg-[var(--bg-card)]/30">
                                    <h3 className="text-[var(--text-secondary)] font-bold text-sm tracking-wide uppercase">
                                        {user?.role === "TENANT" ? "Status Updates" : "Received Requests"}
                                    </h3>
                                    <div className="p-1 px-2 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black">
                                        TOP 3
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        <div className="divide-y divide-[var(--color-main)]/20">
                                            {notifications.map((req) => (
                                                <NavLink
                                                    key={req._id}
                                                    to="/maintenance"
                                                    className="p-4 hover:bg-[var(--bg-card)]/50 transition-colors flex flex-col gap-2 block"
                                                    onClick={() => setOpenNotifications(false)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[var(--text-secondary)] text-sm font-semibold truncate pr-2">
                                                            {req.title}
                                                        </span>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getStatusStyle(req.status)} uppercase font-black tracking-tighter`}>
                                                            {req.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[var(--text-card)] text-xs line-clamp-1 font-medium italic opacity-80">
                                                        {req.description}
                                                    </p>
                                                    <div className="flex items-center justify-between text-[10px] text-[var(--text-card)] font-bold uppercase tracking-wider">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={10} /> {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className={req.priority === "Critical" ? "text-rose-500" : "text-amber-500"}>
                                                            • {req.priority}
                                                        </span>
                                                    </div>
                                                </NavLink>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Bell size={32} className="mx-auto text-[var(--text-card)] mb-2 opacity-20" />
                                            <p className="text-[var(--text-card)] text-xs font-medium">
                                                {user?.role === "TENANT"
                                                    ? "No status updates yet"
                                                    : "No new received requests"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <NavLink
                                    to="/maintenance"
                                    onClick={() => setOpenNotifications(false)}
                                    className="p-3 text-center text-[var(--color-primary)] text-xs font-black uppercase tracking-widest hover:bg-[var(--color-primary)]/5 transition-all border-t border-[var(--color-main)]/30 block"
                                >
                                    View All Activity
                                </NavLink>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Dropdown */}
                <div
                    className="relative"
                    onMouseEnter={() => setOpenAccount(true)}
                    onMouseLeave={() => setOpenAccount(false)}
                >
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-card)] transition-all cursor-pointer">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--text-secondary)]">
                            <User size={16} />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {openAccount && (
                        <div className="absolute right-0 top-full pt-2 z-50">
                            <div className="w-[90vw] sm:w-72 max-w-sm bg-[var(--bg-main)] border border-[var(--color-main)] rounded-2xl shadow-2xl p-5 transition-all duration-200 ease-out shadow-black/50 space-y-5">

                                {/* Title */}
                                <h2 className="text-[var(--text-secondary)] text-lg font-semibold">
                                    User Profile
                                </h2>

                                {/* User Info */}
                                <div className="flex items-center gap-4 mt-5">
                                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white shrink-0">
                                        <User />
                                    </div>

                                    <div className="flex flex-col overflow-hidden space-y-1">
                                        <span className="text-[var(--text-secondary)] font-medium truncate">
                                            {user.name}
                                        </span>
                                        <span className="text-[var(--text-card)] text-xs capitalize">
                                            {user.role}
                                        </span>
                                        <span className="text-[var(--text-card)] text-xs truncate">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="my-5 h-[1px] bg-gray-600"></div>

                                <NavLink to="/profile" className="flex items-center space-x-5 cursor-pointer group">
                                    <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                                        <Layers size={22} />
                                    </div>
                                    <div className="">
                                        <div className="text-[var(--text-secondary)] text-sm hover:text-[var(--text-primary)]">My Profile</div>
                                        <div className="text-[var(--text-card)] text-xs">Account Settings</div>
                                    </div>
                                </NavLink>

                                {/* Logout Button */}
                                <NavLink
                                    to="/logout"
                                    className="block w-full text-center px-4 py-2.5 text-sm font-medium rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-all duration-200"
                                >
                                    Logout
                                </NavLink>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;
