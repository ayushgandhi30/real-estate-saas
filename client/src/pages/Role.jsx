import React from 'react';
import { Shield, Plus, Users, Lock, ChevronRight, Activity, ShieldAlert, ShieldCheck } from 'lucide-react';
import Button from "../components/ui/Button";
import { useAuth } from "../store/auth";

const roles = [
    { title: "Network Overseer", users: 2, desc: "Global administrative authority across all platform layers.", color: "rose", bg: "bg-rose-50" },
    { title: "Asset Manager", users: 5, desc: "Authorized control over resource mapping and consumer units.", color: "indigo", bg: "bg-indigo-50" },
    { title: "Field Logic Tech", users: 8, desc: "Operational focus on maintenance protocols and tickets.", color: "emerald", bg: "bg-emerald-50" },
    { title: "Information Auditor", users: 12, desc: "Read-only ledger access for verification purposes.", color: "amber", bg: "bg-amber-50" },
];

const Role = () => {
    const { user } = useAuth();
    const isDemo = user?.isDemoAccount;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-8 space-y-10 font-['Inter']">
            
            {/* Command Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 pb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-gray-200">
                           <ShieldCheck size={12} className="text-indigo-400" /> Permission Matrix
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">
                           Auth: Verified
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-secondary)] tracking-tight">Access Control & Clearance</h1>
                    <p className="text-[var(--text-muted)] font-medium text-sm">Define user clearance levels and structural permission nodes.</p>
                </div>
                <Button 
                    variant="primary" 
                    size="lg" 
                    icon={isDemo ? <Lock size={18} /> : <Plus size={18} />}
                    className="shadow-2xl shadow-gray-200 group hover:-translate-y-1"
                    disabled={isDemo}
                >
                    {isDemo ? "Matrix Locked (Demo)" : "Forge New Role"}
                </Button>
            </header>

            {/* Quick Insights Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { label: "Active Nodes", val: "27", icon: Users, color: "indigo" },
                 { label: "Clearance Tiers", val: "04", icon: ShieldAlert, color: "emerald" },
                 { label: "Protocol Health", val: "Optimal", icon: Activity, color: "rose" }
               ].map((stat, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 group hover:border-indigo-100 transition-all">
                    <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${
                        idx === 0 ? 'text-indigo-600' : idx === 1 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                       <stat.icon size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">{stat.label}</p>
                       <p className="text-xl font-black text-[var(--color-secondary)]">{stat.val}</p>
                    </div>
                 </div>
               ))}
            </section>

            {/* Main Role Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {roles.map((role, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group relative overflow-hidden flex flex-col min-h-[320px]">
                        
                        {/* Status Decay Logic Decoration */}
                        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${role.bg} opacity-50 scale-0 group-hover:scale-150 transition-transform duration-1000`} />

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={`p-5 rounded-2xl ${role.bg} text-${role.color}-600 border border-${role.color}-100 shadow-sm transition-all duration-700 group-hover:bg-gray-900 group-hover:text-white group-hover:shadow-2xl`}>
                                <Shield size={28} />
                            </div>
                            <div className="flex flex-col items-end">
                               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
                                  {role.users} Entities
                               </span>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10 flex-1">
                           <h3 className="text-2xl font-black text-[var(--color-secondary)] uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{role.title}</h3>
                           <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed opacity-60 italic pr-4">{role.desc}</p>
                        </div>

                        <div className="pt-8 mt-auto border-t border-gray-50 flex items-center justify-between relative z-10">
                           <Button 
                                variant="ghost" 
                                size="xs" 
                                icon={<ChevronRight size={14} />} 
                                iconPosition="right"
                                className="text-indigo-600 hover:text-black transition-colors"
                                disabled={isDemo}
                           >
                                {isDemo ? "View Clearances" : "Update Permissions"}
                           </Button>
                           <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                             <Lock size={12} />
                           </div>
                        </div>
                    </div>
                ))}
                
                {/* Build Placeholder */}
                <div className="bg-gray-50/50 p-10 rounded-[3.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-200 transition-all cursor-pointer group">
                   <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-300 shadow-sm group-hover:scale-110 transition-transform">
                      <Plus size={32} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Construct Clearances</p>
                      <p className="text-[10px] text-gray-300 uppercase font-bold pr-6 pl-6">Establish a new role vector for custom node access.</p>
                   </div>
                </div>
            </div>

            {/* Verification Footer */}
             <footer className="pt-10 flex flex-col items-center justify-center text-center opacity-20 border-t border-gray-50">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em] italic">Access Matrix Authority: Verified</p>
             </footer>

             <style>{`
                @keyframes fade-in {
                   from { opacity: 0; transform: translateY(20px); }
                   to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                   animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1);
                }
             `}</style>
        </div>
    );
};

export default Role;
