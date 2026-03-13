import React, { useState } from "react";
import Button from "../components/ui/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import Input from "../components/ui/Input";
import { useToast } from '../store/ToastContext';
import { LogIn, Mail, Lock, LayoutDashboard, ArrowRight } from "lucide-react";

const SignInPage = () => {
    const { toast } = useToast();
    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate();
    const { storetokenInLS } = useAuth();

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:7000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });

            const res_data = await response.json();

            if (response.ok) {
                storetokenInLS(res_data.token);
                setUser({ email: "", password: "" });
                
                // Redirect based on role
                const userRole = res_data.user.role;
                if (userRole === "TENANT") {
                    navigate("/lease");
                } else if (userRole === "MAINTENANCE_STAFF") {
                    navigate("/maintenance");
                } else {
                    navigate("/dashboard");
                }
            } else {
                toast.error(res_data.message)
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className="min-h-screen flex text-white font-['Jost'] bg-[var(--bg-main)] overflow-hidden relative">
            {/* Left Section - Simple & Clean */}
            <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-16 xl:px-24 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] border-r border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-primary)] opacity-[0.02] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="p-2.5 rounded-xl bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/20">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white uppercase">
                            Material<span className="text-[var(--color-primary)]">M</span>
                        </span>
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-bold mb-8 leading-tight">
                        The Smarter Way to <br />
                        <span className="text-[var(--color-primary)]">Manage Properties.</span>
                    </h1>

                    <div className="space-y-6">
                        {[
                            { title: "Everything in One Place", desc: "Centralize your property data and workflows.", icon: LayoutDashboard },
                            { title: "Secure by Design", desc: "Your data is protected with industry-standard security.", icon: Lock },
                            { title: "Built for Growth", desc: "Scale your portfolio with powerful automation.", icon: ArrowRight }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start group">
                                <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[var(--color-primary)]/50 transition-colors">
                                    <item.icon className="w-4 h-4 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white/90">{item.title}</h3>
                                    <p className="text-sm text-[var(--text-card)]">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[480px] bg-[var(--bg-card)]/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 sm:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold mb-3">Welcome Back</h2>
                        <p className="text-[var(--text-card)]">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                                <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                                <span className="text-sm font-medium text-[var(--text-card)] uppercase tracking-wider">Email Address</span>
                            </div>
                            <Input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleInput}
                                placeholder="name@example.com"
                                className="bg-white/5 border-white/10 focus:bg-white/10 focus:border-[var(--color-primary)] h-13 transition-all rounded-2xl"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-[var(--color-primary)]" />
                                    <span className="text-sm font-medium text-[var(--text-card)] uppercase tracking-wider">Password</span>
                                </div>
                                <span className="text-[var(--color-primary)] text-xs font-semibold cursor-pointer hover:underline underline-offset-4">
                                    Forgot?
                                </span>
                            </div>
                            <Input
                                type="password"
                                name="password"
                                value={user.password}
                                onChange={handleInput}
                                placeholder="••••••••"
                                className="bg-white/5 border-white/10 focus:bg-white/10 focus:border-[var(--color-primary)] h-13 transition-all rounded-2xl"
                                required
                            />
                        </div>

                        <Button type="primary" className="w-full h-14 rounded-2xl text-lg font-bold group shadow-[0_10px_20px_-5px_rgba(0,161,255,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(0,161,255,0.5)]" htmlType="submit">
                            <span className="flex items-center justify-center gap-2">
                                Sign In
                                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[var(--text-card)]">
                            Don't have an account?{" "}
                            <NavLink
                                to="/signup"
                                className="text-[var(--color-primary)] font-bold hover:underline underline-offset-4 decoration-2"
                            >
                                Get Started
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
