import React, { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { NavLink } from "react-router-dom";
import { useToast } from '../store/ToastContext';
import { Mail, ArrowLeft, KeyRound, LayoutDashboard, ShieldCheck, MailQuestion } from "lucide-react";

const ForgotPassword = () => {
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:7000/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const res_data = await response.json();

            if (response.ok) {
                toast.success(res_data.message || "Reset link sent!");
                setEmail("");
            } else {
                toast.error(res_data.message || "Failed to send reset link");
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-white font-['Jost'] bg-[var(--bg-main)] overflow-hidden relative">
            {/* Left Section - Simple & Clean */}
            <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-16 xl:px-24 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] border-r border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-primary)] opacity-[0.02] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center mb-12">
                        <img src="/SVGs/logo.jpg" alt="Logo" className="h-30 w-auto rounded-xl shadow-lg" />
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-bold mb-8 leading-tight">
                        Secure Your Account <br />
                        <span className="text-[var(--color-primary)]">Easily.</span>
                    </h1>

                    <div className="space-y-6">
                        {[
                            { title: "Quick Recovery", desc: "Get back into your account in just a few minutes.", icon: KeyRound },
                            { title: "Safe & Encrypted", desc: "Your security is our top priority.", icon: ShieldCheck },
                            { title: "24/7 Support", desc: "Need help? Our team is always here for you.", icon: MailQuestion }
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

            {/* Right Section - Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-[480px] bg-[var(--bg-card)]/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 sm:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20">
                    <div className="mb-10">
                        <div className="p-3 w-fit rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 mb-6">
                            <KeyRound className="w-8 h-8 text-[var(--color-primary)]" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Forgot Password?</h2>
                        <p className="text-[var(--text-card)]">
                            Enter your email address and we'll send you a link to reset your password.
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="bg-white/5 border-white/10 focus:bg-white/10 focus:border-[var(--color-primary)] h-13 transition-all rounded-2xl"
                                required
                            />
                        </div>

                        <Button 
                            type="primary" 
                            className="w-full h-14 rounded-2xl text-lg font-bold group shadow-[0_10px_20px_-5px_rgba(0,161,255,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(0,161,255,0.5)] flex items-center justify-center gap-2" 
                            htmlType="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending Link..." : "Send Reset Link"}
                            <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-12 text-center pt-6 border-t border-white/5">
                        <NavLink
                            to="/"
                            className="inline-flex items-center gap-2 text-[var(--color-primary)] font-bold hover:underline underline-offset-4 decoration-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;