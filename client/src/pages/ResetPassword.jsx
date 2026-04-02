import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from '../store/ToastContext';
import { Lock, ShieldCheck, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2, Mail, Hash } from "lucide-react";
import { BASE_URL } from "../store/api";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Automatically populate email if passed from ForgotPassword view
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            return toast.error("Email is required");
        }

        if (!otp) {
            return toast.error("OTP is required");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp, password }),
            });

            const res_data = await response.json();

            if (response.ok) {
                toast.success("Password updated successfully!");
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                toast.error(res_data.message || "Failed to reset password");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-[var(--text-secondary)] bg-[var(--bg-main)] overflow-hidden relative">
            {/* Side Panel - Aesthetic Mesh */}
            <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-16 xl:px-24 bg-mesh border-r border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center mb-10">
                        <img src="/SVGs/logo.jpg" alt="Logo" className="h-24 w-auto rounded-xl shadow-md" />
                    </div>

                    <h1 className="text-3xl xl:text-4xl font-black mb-8 leading-tight tracking-tight text-[var(--color-secondary)]">
                        Reset Your <br />
                        <span className="hero-gradient-text">Credentials.</span>
                    </h1>

                    <div className="space-y-6">
                        {[
                            { title: "One Step Away", desc: "Choose a strong password to protect your account.", icon: Lock },
                            { title: "Universal Access", desc: "Once updated, use your new password across all devices.", icon: CheckCircle2 }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-5 items-start group">
                                <div className="mt-1 p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm group-hover:border-[var(--color-primary)]/40 group-hover:shadow-[0_4px_12px_rgba(231,76,60,0.1)] transition-all">
                                    <item.icon className="w-4 h-4 text-[var(--color-primary)] opacity-80" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--color-secondary)] text-base group-hover:text-[var(--color-primary)] transition-colors">{item.title}</h3>
                                    <p className="font-md text-[var(--text-muted)] mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Form Container */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 relative z-10 bg-[var(--bg-main)]">
                <div className="w-full max-w-[440px] premium-card rounded-[2.5rem] p-10 sm:p-12">
                    <div className="mb-10 text-center sm:text-left">
                        <div className="p-3.5 w-fit rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 mb-6 mx-auto sm:mx-0 shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-[var(--color-primary)] opacity-90" />
                        </div>
                        <h2 className="text-2xl font-black mb-3 text-[var(--color-secondary)] tracking-tight">New Password</h2>
                        <p className="font-md text-[var(--text-muted)] leading-relaxed">
                            Enter the OTP sent to your email and establish a strong password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-1 ml-1 text-xs font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em] opacity-80">
                                <Mail className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                Email Address
                            </div>
                            <Input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[var(--color-primary)] h-13 transition-all rounded-xl font-md shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-1 ml-1 text-xs font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em] opacity-80">
                                <Hash className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                6-Digit OTP
                            </div>
                            <Input
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                className="bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[var(--color-primary)] h-13 transition-all rounded-xl font-md shadow-sm font-bold tracking-widest text-center"
                                required
                                maxLength={6}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between mb-1 ml-1 text-xs font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em] opacity-80">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                    New Password
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[var(--text-muted)] hover:text-[var(--color-secondary)] transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[var(--color-primary)] h-13 transition-all rounded-xl font-md shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-1 ml-1 text-xs font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em] opacity-80">
                                <Lock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                Confirm Password
                            </div>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[var(--color-primary)] h-13 transition-all rounded-xl font-md shadow-sm"
                                required
                            />
                        </div>

                        <Button 
                            type="primary" 
                            className="w-full h-14 rounded-xl font-md font-extrabold group shadow-[0_15px_30px_-5px_rgba(231,76,60,0.2)] hover:shadow-[0_20px_40px_-5px_rgba(231,76,60,0.3)] transition-all flex items-center justify-center gap-3 mt-4" 
                            htmlType="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating..." : "Reset Password"}
                            <KeyRound className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-50/50">
                        <NavLink
                            to="/"
                            className="inline-flex items-center gap-2.5 text-[var(--color-primary)] font-black hover:underline underline-offset-8 font-md transition-all group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Sign In
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;