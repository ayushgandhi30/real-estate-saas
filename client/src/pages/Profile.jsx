import React, { useEffect, useState } from "react";
import Input from "../components/ui/Input";
import { useAuth } from "../store/auth";
import { BASE_URL } from "../store/api";
import { useToast } from "../store/ToastContext";
import Button from "../components/ui/Button";
import {
   User,
   Mail,
   Phone,
   Camera,
   Save,
   ShieldCheck,
   Lock
} from "lucide-react";

const Profile = () => {
   const { user, setUser } = useAuth();
   const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "" });
   const { toast } = useToast();
   const [isSavingProfile, setIsSavingProfile] = useState(false);

   useEffect(() => {
      if (user) {
         setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || ""
         });
      }
   }, [user]);

   const handleChange = (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
         ...prev,
         [name]: value
      }));
   };


   const handleSave = async () => {
      try {
         setIsSavingProfile(true);
         const token = localStorage.getItem("token");

         const response = await fetch(`${BASE_URL}/api/auth/profile`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
               name: formData.name,
               email: formData.email,
               phone: formData.phone
            })
         });

         const data = await response.json();

         if (response.ok) {
            setUser(data.user);
            toast.success(data.message || "Profile updated successfully");
         } else {
            toast.error(data.message || "Failed to update profile");
         }
      } catch (error) {
         console.error("Profile update error:", error);
         toast.error("Something went wrong while updating profile");
      } finally {
         setIsSavingProfile(false);
      }
   };


   return (
      <div className="min-h-screen bg-[var(--bg-main)] p-4 sm:p-6 lg:p-0 space-y-5 font-['Inter']">

         {/* Header */}
         <header className="max-w-7xl mx-auto w-full">
            <h1 className="text-2xl font-black text-[var(--color-secondary)] tracking-tight">
               Profile & Security
            </h1>
         </header>

         <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Profile Avatar Section */}
            <div className="lg:col-span-4 lg:translate-y-2">
               <div className="bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-10 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />

                  <div className="relative">
                     <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl transition-transform hover:scale-105 duration-500">
                        {formData?.name?.[0] || "U"}
                     </div>
                     <button 
                        className={`absolute -bottom-2 -right-2 p-2 bg-white border border-gray-100 rounded-xl shadow-lg text-indigo-600 hover:bg-slate-900 hover:text-white transition-all ${user?.isDemoAccount ? "cursor-not-allowed opacity-50" : ""}`}
                        disabled={user?.isDemoAccount}
                     >
                        <Camera size={14} />
                     </button>
                  </div>

                  <div className="mt-8 space-y-2">
                     <h3 className="text-lg font-black text-[var(--color-secondary)] uppercase tracking-tight">
                        {formData?.name}
                     </h3>
                     <span className="inline-flex px-4 py-1.5 bg-indigo-50/50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100/50">
                        {formData?.role}
                     </span>
                  </div>
               </div>
            </div>

            {/* Information Form */}
            <div className="lg:col-span-8">
               <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 border border-gray-100">
                           <User size={18} />
                        </div>
                        <h2 className="text-xs font-black text-[var(--color-secondary)] uppercase tracking-[0.1em]">
                           Personal Information
                        </h2>
                     </div>
                  </div>

                  <div className="p-6 sm:p-10 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <Input
                           label="Full Name"
                           name="name"
                           value={formData.name}
                           onChange={handleChange}
                           placeholder="Your full name"
                           labelClassName="text-[12px] font-black  uppercase text-gray-400 ml-1"
                           className="bg-gray-50/50 border-gray-100 rounded-xl h-12 text-sm font-bold"
                        />

                        <Input
                           label="Email Address"
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleChange}
                           placeholder="Your email"
                           labelClassName="text-[12px] font-black uppercase text-gray-400 ml-1"
                           className="bg-gray-50/50 border-gray-100 rounded-xl h-12 text-sm font-bold"
                        />

                        <Input
                           label="Contact Number"
                           name="phone"
                           value={formData.phone}
                           onChange={handleChange}
                           placeholder="Your phone"
                           labelClassName="text-[12px] font-black uppercase text-gray-400 ml-1"
                           className="bg-gray-50/50 border-gray-100 rounded-xl h-12 text-sm font-bold"
                        />

                        <Input
                           label="System Role"
                           value={formData.role}
                           readOnly
                           labelClassName="text-[12px] font-black uppercase text-gray-400 ml-1"
                           className="bg-gray-50 border-gray-100 rounded-xl h-12 text-sm font-bold opacity-50 cursor-not-allowed"
                        />
                     </div>

                     <div className="flex justify-end pt-4">
                        <Button
                           onClick={handleSave}
                           loading={isSavingProfile}
                           variant="primary"
                           size="lg"
                           className="w-full sm:w-auto px-10 py-4 h-14 rounded-xl bg-slate-900 border-none shadow-xl shadow-slate-200 t uppercase text-[10px] font-black"
                           icon={user?.isDemoAccount ? <Lock size={14} /> : <Save size={14} />}
                           disabled={user?.isDemoAccount}
                        >
                           {user?.isDemoAccount ? "Locked (Demo Account)" : "Commit Changes"}
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Profile;
