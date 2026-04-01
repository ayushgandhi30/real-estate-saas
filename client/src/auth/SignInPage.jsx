import React, { useState } from "react";
import Button from "../components/ui/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { BASE_URL } from "../store/api";
import Input from "../components/ui/Input";
import { useToast } from '../store/ToastContext';
import { LogIn, Mail, Lock, LayoutDashboard, ArrowRight, Loader2 } from "lucide-react";

const SignInPage = () => {
    const { toast } = useToast();
    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
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
                toast.error(res_data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            if (error.name === "AbortError") {
                toast.error("Server is not responding. Please try again later.");
            } else {
                toast.error("Network error. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-[var(--text-secondary)] bg-[var(--bg-main)] font-['Inter']">
            {/* Left Section - Aesthetic & Modern */}
            <div className="hidden lg:flex lg:w-[50%] flex-col justify-between p-12 bg-[var(--color-primary)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-blue-900 opacity-90 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80')] bg-cover bg-center mix-blend-overlay opacity-40 z-0"></div>

                <div className="relative z-10 flex items-center">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <LayoutDashboard className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <span className="ml-3 text-2xl font-black text-white tracking-tight">EstateFlow.</span>
                </div>

                <div className="relative z-10 text-white space-y-6 max-w-lg mb-12">
                    <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                        The Smarter Way to <br />
                        Manage Properties.
                    </h1>
                    <p className="text-lg text-blue-100/80 font-medium leading-relaxed">
                        Experience unified management, military-grade security, and seamless automation in one completely redesigned, beautiful interface.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <Lock className="w-4 h-4 text-blue-200" />
                            <span className="text-sm font-semibold text-blue-50">Secure Access</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <ArrowRight className="w-4 h-4 text-blue-200" />
                            <span className="text-sm font-semibold text-blue-50">Fast Workflow</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex gap-4 text-blue-100/60 text-sm font-medium">
                    <span>© 2026 EstateFlow. All rights reserved.</span>
                </div>
            </div>

            {/* Right Section - Aesthetic Login Form */}
            <div className="w-full lg:w-[50%] flex items-center justify-center p-6 relative z-10 bg-[var(--bg-main)]">
                <div className="w-full max-w-[440px] bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
                    <div className="mb-10 text-center sm:text-left">
                        <h2 className="text-3xl font-black mb-2 text-[var(--color-secondary)] tracking-tight">Welcome Back</h2>
                        <p className="font-medium text-[var(--text-muted)] text-base">
                            Enter your credentials to access your dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleInput}
                            placeholder="name@example.com"
                            icon={Mail}
                            required
                        />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-[var(--text-secondary)] opacity-90">Password</span>
                                </label>
                                <NavLink to="/forgot-password" className="text-sm font-bold text-[var(--color-primary)] hover:text-blue-700 hover:underline underline-offset-4 transition-colors">
                                    Forgot password?
                                </NavLink>
                            </div>
                            <Input
                                type="password"
                                name="password"
                                variant="default"
                                value={user.password}
                                onChange={handleInput}
                                placeholder="••••••••"
                                icon={Lock}
                                required
                            />
                        </div>

                        <Button type="primary" className="w-full h-14 outline-none border-none rounded-xl text-lg font-extrabold group bg-[var(--color-primary)] hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(0,118,255,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(0,118,255,0.5)] transition-all hover:-translate-y-0.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed" htmlType="submit" disabled={loading}>
                            <span className="flex items-center justify-center gap-2">
                                {loading ? "Signing In..." : "Sign In"}
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />}
                            </span>
                        </Button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="font-medium text-[var(--text-muted)] text-sm">
                            Don't have an account?{" "}
                            <NavLink
                                to="/signup"
                                className="text-[var(--color-primary)] font-bold hover:underline underline-offset-4 ml-1 transition-colors hover:text-blue-700"
                            >
                                Register now
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
