import React, { useState } from "react";
import Button from "../components/ui/Button";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import Input from "../components/ui/Input";
import { UserPlus, Mail, Lock, User, LayoutDashboard, ArrowRight, ShieldCheck, Home } from "lucide-react";

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
    <div className="min-h-screen flex text-[var(--text-secondary)] font-['Inter'] bg-[var(--bg-main)]">
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
            Start Your Journey <br />
            with Trevita.
          </h1>
          <p className="text-lg text-blue-100/80 font-medium leading-relaxed">
            Join thousands of property managers using Trevita to automate their workflow, boost security, and scale operations effortlessly.
          </p>

          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <ShieldCheck className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-semibold text-blue-50">Verified Platform</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Home className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-semibold text-blue-50">Unlimited Properties</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 text-blue-100/60 text-sm font-medium">
          <span>© 2026 Trevita. All rights reserved.</span>
        </div>
      </div>

      {/* Right Section - SignUp Form */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 lg:p-12 relative z-10 overflow-y-auto bg-[var(--bg-main)]">
        <div className="w-full max-w-[520px] bg-white rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-black mb-2 text-[var(--color-secondary)] tracking-tight">Create Account</h2>
            <p className="font-medium text-[var(--text-muted)] text-base">
              Begin your professional experience today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                icon={User}
                required
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                icon={Mail}
                required
              />
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={ShieldCheck}
              required
            />

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium animate-shake flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex items-center py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    required
                    className="peer appearance-none w-5 h-5 rounded border-2 border-gray-300 bg-white checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all cursor-pointer"
                  />
                  <svg className="w-3.5 h-3.5 absolute left-[3px] top-[3px] text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                  I agree to the <span className="text-[var(--color-primary)] hover:underline hover:text-blue-700">Terms of Service</span> and <span className="text-[var(--color-primary)] hover:underline hover:text-blue-700">Privacy Policy</span>
                </span>
              </label>
            </div>

            <Button type="primary" className="w-full h-14 outline-none border-none rounded-xl text-lg font-extrabold group bg-[var(--color-primary)] hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(0,118,255,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(0,118,255,0.5)] transition-all hover:-translate-y-0.5 mt-2" htmlType="submit">
              <span className="flex items-center justify-center gap-2">
                Create Account
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </span>
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-medium text-[var(--text-muted)] text-sm">
              Already have an account?{" "}
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

export default SignUpPage;
