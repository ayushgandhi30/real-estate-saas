import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Lock, Globe, Shield, Activity, Sliders, Monitor, CreditCard, Navigation, Inbox } from 'lucide-react';
import Button from "../components/ui/Button";
import { useAuth } from "../store/auth";

const Settings = () => {
    const { user } = useAuth();
    const isDemo = user?.isDemoAccount;
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General Configuration', icon: Globe, desc: "Primary site logistics" },
        { id: 'security', label: 'Security Firewall', icon: Lock, desc: "Network access protocols" },
        { id: 'notifications', label: 'Alert Center', icon: Bell, desc: "System notification matrix" },
        { id: 'billing', label: 'Finance & Billing', icon: CreditCard, desc: "Ledger and subscriptions" },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-8 space-y-10 font-['Inter']">

            {/* Header Area */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-gray-200">
                            <Sliders size={12} className="text-indigo-400" /> Platform Defaults
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">
                            Mode: Root Config
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--color-secondary)] tracking-tight">System Parameters</h1>
                    <p className="text-[var(--text-muted)] font-medium text-sm">Fine-tune the global behavioral logic of the <span className="text-indigo-600 font-bold">AQUA THUNDER</span> ecosystem.</p>
                </div>
            </header>

            <div className="bg-white rounded-[4rem] border border-gray-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.03)] flex flex-col xl:flex-row overflow-hidden min-h-[700px]">

                {/* Tactical Sidebar */}
                <aside className="xl:w-80 border-b xl:border-b-0 xl:border-r border-gray-50 flex flex-col bg-gray-50/20">
                    <div className="p-10 border-b border-gray-50 flex items-center gap-4 bg-white/50">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                            <SettingsIcon size={24} className="animate-spin-slow" />
                        </div>
                        <h2 className="text-xl font-black text-[var(--color-secondary)] tracking-tight uppercase">Control Hub</h2>
                    </div>

                    <nav className="p-6 space-y-3">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full group flex items-start gap-5 px-6 py-5 rounded-[2.5rem] transition-all duration-500 text-left ${isActive
                                        ? 'bg-white text-indigo-600 shadow-xl shadow-gray-200 border border-indigo-50/50 scale-105 z-10'
                                        : 'text-[var(--text-muted)] hover:bg-white/80 hover:text-[var(--color-secondary)]'
                                        }`}
                                >
                                    <div className={`p-3 rounded-2xl transition-all duration-700 ${isActive ? 'bg-indigo-600 text-white' : 'bg-white group-hover:bg-indigo-50 group-hover:text-indigo-600 shadow-sm border border-gray-100'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className={`text-xs font-black uppercase tracking-widest mb-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-[var(--text-muted)]'}`}>{tab.label}</p>
                                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase opacity-30 group-hover:opacity-50 transition-opacity truncate">{tab.desc}</p>
                                    </div>
                                    <Navigation size={12} className={`mt-1.5 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto p-10 border-t border-gray-50 bg-white/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Shield size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-secondary)]">Root Access</p>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 animate-pulse">Encryption Active</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Logistics Content Area */}
                <main className="flex-1 p-10 xl:p-20 relative overflow-hidden flex flex-col">
                    {/* Animated BG Decoration */}
                    <div className="absolute top-0 right-0 p-40 opacity-[0.02] -mr-20 -mt-20 pointer-events-none group hover:rotate-90 transition-transform duration-1000">
                        <SettingsIcon size={300} />
                    </div>

                    {activeTab === 'general' && (
                        <div className="space-y-12 max-w-3xl relative z-10 animate-in translate-y-0">
                            <header className="space-y-2 border-l-4 border-indigo-600 pl-8">
                                <h3 className="text-3xl font-black text-[var(--color-secondary)] uppercase tracking-tight">Main Platform Logistics</h3>
                                <p className="text-[var(--text-muted)] text-sm font-medium">Define the core metadata and timezone mapping for the entire asset network.</p>
                            </header>

                            <div className="grid gap-12 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 group">
                                        <label className="flex items-center gap-3 text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-2 group-focus-within:text-indigo-600 transition-colors">
                                            <Monitor size={14} className="text-gray-400 group-focus-within:text-indigo-400" /> Platform Entity Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="Real Estate SaaS"
                                            className="w-full bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-[2rem] px-8 py-5 text-sm font-black text-[var(--color-secondary)] shadow-sm focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3 group">
                                        <label className="flex items-center gap-3 text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-2 group-focus-within:text-indigo-600 transition-colors">
                                            <Inbox size={14} className="text-gray-400 group-focus-within:text-indigo-400" /> Response Gateway (Support)
                                        </label>
                                        <input
                                            type="email"
                                            defaultValue="support@aquathunder.com"
                                            className="w-full bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-[2rem] px-8 py-5 text-sm font-black text-[var(--color-secondary)] shadow-sm focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3 group md:col-span-2">
                                        <label className="flex items-center gap-3 text-[10px] font-black text-[var(--color-secondary)] uppercase tracking-widest ml-2 group-focus-within:text-indigo-600 transition-colors">
                                            <Globe size={14} className="text-gray-400 group-focus-within:text-indigo-400" /> Temporal Zone Offset
                                        </label>
                                        <select className="w-full bg-gray-50/50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-[2rem] px-8 py-5 text-sm font-black text-[var(--color-secondary)] shadow-sm focus:outline-none appearance-none cursor-pointer transition-all">
                                            <option>UTC (Coordinated Universal Time)</option>
                                            <option>IST (India Standard Time) +5:30</option>
                                            <option>EST (Eastern Standard Time)</option>
                                            <option>PST (Pacific Standard Time)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-10 flex items-center justify-between border-t border-gray-50">
                                    <div className="flex items-center gap-4 text-gray-400">
                                        <Activity size={18} className="animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">All parameters subject to root audit logs.</p>
                                    </div>
                                    <Button 
                                        variant="indigo"
                                        size="lg"
                                        disabled={isDemo}
                                        icon={isDemo ? <Lock size={18} /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                                    >
                                        {isDemo ? "Locked (Demo Mode)" : "Authorize Changes"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'general' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in delay-200">
                            <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 border border-gray-100 shadow-inner group cursor-wait hover:scale-110 transition-transform duration-700">
                                <SettingsIcon size={64} className="opacity-40 group-hover:rotate-180 transition-transform duration-1000" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-[var(--color-secondary)] uppercase tracking-tight italic">Protocol Module Locked</p>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40">Tactical settings for <span className="text-indigo-600">{activeTab.toUpperCase()}</span> are pending authorization.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Global Visual Assets */}
            <style>{`
               .animate-spin-slow {
                   animation: spin-slow 12s linear infinite;
                }
               @keyframes spin-slow {
                   from { transform: rotate(0deg); }
                   to { transform: rotate(360deg); }
                }
               @keyframes fade-in {
                   from { opacity: 0; transform: translateX(20px); }
                   to { opacity: 1; transform: translateX(0); }
                }
               .animate-in {
                   animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};

export default Settings;
