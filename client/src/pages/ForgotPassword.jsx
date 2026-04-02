import React, { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { NavLink, useNavigate } from "react-router-dom";
import { useToast } from '../store/ToastContext';
import { Mail, ArrowLeft, KeyRound, LayoutDashboard, ShieldCheck, MailQuestion } from "lucide-react";
import { BASE_URL } from "../store/api";

const ForgotPassword = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const res_data = await response.json();

            if (response.ok) {
                toast.success(res_data.message || "OTP sent successfully!");
                navigate("/reset-password", { state: { email } });
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
        <div className="min-h-screen flex text-[var(--text-secondary)] bg-[var(--bg-main)] overflow-hidden relative">
            {/* Side Panel - Aesthetic Mesh */}
            <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-16 xl:px-24 bg-mesh border-r border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                    {/* <div className="flex items-center mb-10">
                        <img src="/SVGs/logo.jpg" alt="Logo" className="h-24 w-auto rounded-xl shadow-md" />
                    </div> */}

                    <h1 className="text-3xl xl:text-4xl font-black mb-8 leading-tight tracking-tight text-[var(--color-secondary)]">
                        Secure Your Account <br />
                        <span className="hero-gradient-text">Easily.</span>
                    </h1>

                    <div className="space-y-6">
                        {[
                            { title: "Quick Recovery", desc: "Get back into your account in just a few minutes.", icon: KeyRound },
                            { title: "Safe & Encrypted", desc: "Your security is our top priority.", icon: ShieldCheck },
                            { title: "24/7 Support", desc: "Need help? Our team is always here for you.", icon: MailQuestion }
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
                            <KeyRound className="w-6 h-6 text-[var(--color-primary)] opacity-90" />
                        </div>
                        <h2 className="text-2xl font-black mb-3 text-[var(--color-secondary)] tracking-tight">Forgot Password?</h2>
                        <p className="font-md text-[var(--text-muted)] leading-relaxed">
                            We'll send a secure restoration link to your verified email.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 mb-1 ml-1 text-xs font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em] opacity-80">
                                <Mail className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                Recovery Email
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

                        <Button
                            type="primary"
                            className="w-full h-14 rounded-xl font-md font-extrabold group shadow-[0_15px_30px_-5px_rgba(231,76,60,0.2)] hover:shadow-[0_20px_40px_-5px_rgba(231,76,60,0.3)] transition-all flex items-center justify-center gap-3 mt-2"
                            htmlType="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Dispatching..." : "Send Reset Link"}
                            <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </Button>
                    </form>

                    <div className="mt-12 text-center pt-8 border-t border-gray-50/50">
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

export default ForgotPassword;