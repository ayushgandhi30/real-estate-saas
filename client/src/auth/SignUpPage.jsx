import React, { useState } from "react";
import Button from "../components/ui/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import Input from "../components/ui/Input";
import { UserPlus, Mail, Lock, User, LayoutDashboard, ArrowRight, ShieldCheck } from "lucide-react";

const SignUpPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { storetokenInLS } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:7000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password
          }),
        }
      );

      const res_data = await response.json();

      if (response.ok) {
        storetokenInLS(res_data.token);
        navigate("/");
      } else {
        setError(res_data.message || "Registration failed");
      }
    } catch (error) {
      console.log("Register error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex text-white font-['Jost'] bg-[var(--bg-main)] overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Left Section - Simple & Clean */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-16 xl:px-24 bg-gradient-to-tr from-[var(--bg-card)] to-[var(--bg-main)] border-r border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-primary)] opacity-[0.02] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center mb-12">
            <img src="/SVGs/logo.jpg" alt="Logo" className="h-30 w-auto rounded-xl shadow-lg" />
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold mb-8 leading-tight">
            Start Your Journey <br />
            <span className="text-[var(--color-primary)]">with us.</span>
          </h1>

          <div className="space-y-6">
            {[
              { title: "Quick Onboarding", desc: "Get your portfolio set up in minutes.", icon: UserPlus },
              { title: "Collaborative Tools", desc: "Manage teams and tenants effortlessly.", icon: User },
              { title: "Data-Driven Insights", desc: "Make informed decisions with real-time stats.", icon: LayoutDashboard }
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

      {/* Right Section - SignUp Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[520px] bg-[var(--bg-card)]/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-[var(--text-card)]">
              Begin your professional property management experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <User className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-medium text-[var(--text-card)] uppercase tracking-wider">Full Name</span>
                </div>
                <Input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 focus:bg-white/10 focus:border-[var(--color-primary)] h-12 transition-all rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-medium text-[var(--text-card)] uppercase tracking-wider">Email</span>
                </div>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="bg-white/5 border-white/10 focus:bg-white/10 focus:border-[var(--color-primary)] h-12 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <Lock className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-xs font-medium text-[var(--text-card)] uppercase tracking-wider">Password</span>
              </div>
              <Input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-white/5 border-white/10 focus:bg-white/10 focus:border-[var(--color-primary)] h-12 transition-all rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-xs font-medium text-[var(--text-card)] uppercase tracking-wider">Confirm Password</span>
              </div>
              <Input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-white/5 border-white/10 focus:bg-white/10 focus:border-[var(--color-primary)] h-12 transition-all rounded-xl"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 py-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    required
                    className="peer appearance-none w-5 h-5 rounded-md border border-white/20 bg-white/5 checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all"
                  />
                  <svg className="w-3.5 h-3.5 absolute left-0.75 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-xs text-[var(--text-card)] group-hover:text-white transition-colors leading-relaxed">
                  I agree to the <span className="text-[var(--color-primary)] hover:underline">Terms of Service</span> and <span className="text-[var(--color-primary)] hover:underline">Privacy Policy</span>
                </span>
              </label>
            </div>

            <Button type="primary" className="w-full h-13 rounded-xl text-lg font-bold group shadow-[0_10px_20px_-5px_rgba(0,161,255,0.4)]" htmlType="submit">
              <span className="flex items-center justify-center gap-2">
                Create Account
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </span>
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[var(--text-card)] text-sm">
              Already have an account?{" "}
              <NavLink
                to="/"
                className="text-[var(--color-primary)] font-bold hover:underline underline-offset-4 decoration-2 text-base"
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

export default SignUpPage;
