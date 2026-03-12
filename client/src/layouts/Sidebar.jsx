import React from "react";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    MapPin,
    Building2,
    Settings,
    BarChart3,
    CreditCard,
    FileSearch,
    UserCog,
    X,
    Layers,
    Wrench,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../store/auth";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "TENANT", "TECHNICIAN"] },
    { name: "Users", icon: Users, path: "/users", roles: ["SUPER_ADMIN", "MANAGER"] },
    { name: "Role", icon: ShieldCheck, path: "/roles", roles: ["SUPER_ADMIN"] },
    { name: "Property", icon: Building2, path: "/properties", roles: ["SUPER_ADMIN", "OWNER"] },
    { name: "Floor & Unit", icon: Building2, path: "/floor", roles: ["OWNER"] },
    { name: "Settings", icon: Settings, path: "/settings", roles: ["SUPER_ADMIN"] },
    // { name: "Subscriptions", icon: CreditCard, path: "/subscriptions", roles: ["SUPER_ADMIN", "OWNER"] },
    { name: "Audit Logs", icon: FileSearch, path: "/audit-logs", roles: ["SUPER_ADMIN"] },
    { name: "Tenant", icon: UserCog, path: "/tenant", roles: ["SUPER_ADMIN", "OWNER", "MANAGER"] },
    { name: "Revenue Report", icon: CreditCard, path: "/revenue-report", roles: ["SUPER_ADMIN", "OWNER"] },
    { name: "Lease", icon: CreditCard, path: "/lease", roles: ["TENANT"] },
    { name: "Maintenance", icon: Wrench, path: "/maintenance", roles: ["TENANT", "MANAGER", "OWNER"] },
    { name: "Invoice", icon: CreditCard, path: "/invoice", roles: ["TENANT", "MANAGER"] },
    { name: "Profile & Security", icon: UserCog, path: "/profile", roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "TENANT", "TECHNICIAN"] },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const userRole = user?.role || "TENANT";

    const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    return (
        <>
            {/* Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed z-50 lg:static top-0 left-0 h-full w-72 bg-[var(--color-card)] text-[var(--text-secondary)]
        transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 flex flex-col`}
            >
                {/* Header  */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-slate-700/50">
                    <div className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent rounded-xl border-l-4 border-[var(--color-primary)] shadow-sm">
                        <Layers size={18} className="text-[var(--color-primary)]" />
                        <span className="text-white text-sm font-extrabold uppercase tracking-widest whitespace-nowrap">
                            {user?.role === "OWNER" && "Owner Panel"}
                            {user?.role === "MANAGER" && "Manager Panel"}
                            {user?.role === "SUPER_ADMIN" && "Super Admin Panel"}
                            {user?.role === "TENANT" && "Tenant Panel"}
                            {user?.role === "TECHNICIAN" && "Tech Panel"}
                            {!["OWNER", "MANAGER", "SUPER_ADMIN", "TENANT", "TECHNICIAN"].includes(user?.role) && "User Panel"}
                        </span>
                    </div>
                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
                    {filteredMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3.5 rounded-full text-sm font-medium transition-all duration-300  group
                   ${isActive
                                        ? "bg-[#17344f] text-[var(--text-primary)] shadow-lg translate-x-1 "
                                        : "hover:bg-slate-800/50 hover:text-white hover:translate-x-1 text-[var(--text-secondary)]"
                                    }`
                                }
                            >
                                <Icon size={20} className={`transition-colors ${
                                    // You can add logic here if you want icon color to change differently
                                    ""
                                    }`} />
                                <span className="font-[var(--font-body)]">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>



                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
                    © 2026 Your SaaS
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
