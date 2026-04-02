import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from '../store/ToastContext';
import { Lock, ShieldCheck, ArrowRight, KeyRound, Eye, EyeOff, CheckCircle2, Mail, Hash, LayoutDashboard, Loader2 } from "lucide-react";
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
        <div className="min-h-screen flex text-[var(--text-secondary)] bg-[var(--bg-main)] font-['Inter']">
            {/* Left Section - Same as SignIn */}
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
                        Reset Your <br />
                        Password.
                    </h1>
                    <p className="text-lg text-blue-100/80 font-medium leading-relaxed">
                        Enter the 6-digit OTP we sent to your email and set a new secure password. Your account will be back in your hands in no time.
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

            {/* Right Section - Form */}
            <div className="w-full lg:w-[50%] flex items-center justify-center p-6 relative z-10 bg-[var(--bg-main)]">
                <div className="w-full max-w-[440px] bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
                    <div className="mb-10 text-center sm:text-left">
                        <h2 className="text-3xl font-black mb-2 text-[var(--color-secondary)] tracking-tight">Reset Password</h2>
                        <p className="font-medium text-[var(--text-muted)] text-base">
                            Enter the OTP and set your new password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            icon={Mail}
                            required
                        />

                        <Input
                            label="6-Digit OTP"
                            type="text"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            icon={Hash}
                            required
                            maxLength={6}
                        />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-[var(--text-secondary)] opacity-90">New Password</span>
                                </label>
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-sm font-bold text-[var(--color-primary)] hover:text-blue-700 hover:underline underline-offset-4 transition-colors"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={Lock}
                                required
                            />
                        </div>

                        <Input
                            label="Confirm Password"
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            icon={Lock}
                            required
                        />

                        <Button type="primary" className="w-full h-14 outline-none border-none rounded-xl text-lg font-extrabold group bg-[var(--color-primary)] hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(0,118,255,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(0,118,255,0.5)] transition-all hover:-translate-y-0.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed" htmlType="submit" disabled={isLoading}>
                            <span className="flex items-center justify-center gap-2">
                                {isLoading ? "Updating..." : "Reset Password"}
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            </span>
                        </Button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="font-medium text-[var(--text-muted)] text-sm">
                            Remember your password?{" "}
                            <NavLink
                                to="/"
                                className="text-[var(--color-primary)] font-bold hover:underline underline-offset-4 ml-1 transition-colors hover:text-blue-700"
                            >
                                Sign In
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;