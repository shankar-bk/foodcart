"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { User, Mail, MapPin, Lock, Save, Camera, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import axios from "axios";

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: ""
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (session) {
            fetchProfile();
        }
    }, [session, status]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/api/profile");
            setFormData({
                ...formData,
                name: res.data.name || "",
                email: res.data.email || "",
                address: res.data.address || "",
            });
        } catch (e) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" });
            return;
        }

        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            await axios.put("/api/profile", {
                name: formData.name,
                address: formData.address,
                password: formData.password
            });
            
            // Update next-auth session
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: formData.name
                }
            });

            setMessage({ type: "success", text: "Profile updated successfully!" });
            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.error || "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };

    if (status === "loading" || loading) return <div className="p-10 text-center text-orange-600 font-bold">Loading your profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                
                <div className="mb-10 text-center">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl mx-auto overflow-hidden">
                            <User className="h-16 w-16 text-orange-600" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <h1 className="mt-4 text-3xl font-black text-gray-900">{formData.name || "User Profile"}</h1>
                    <p className="text-gray-500 font-medium uppercase tracking-widest text-xs mt-1">{session?.user?.role} Account</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Sidebar Tabs (Mockup) */}
                    <div className="space-y-2">
                        <button className="w-full text-left px-6 py-4 bg-white border border-orange-100 text-orange-600 font-bold rounded-2xl shadow-sm flex items-center justify-between group">
                            <span className="flex items-center gap-3"><User className="h-5 w-5" /> General</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button className="w-full text-left px-6 py-4 text-gray-400 font-bold rounded-2xl hover:bg-white transition-all flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5" /> Privacy & Security
                        </button>
                    </div>

                    {/* Main Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-100 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500" /> Account Settings
                            </h2>

                            {message.text && (
                                <div className={`mb-6 p-4 rounded-2xl text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address (Fixed)</label>
                                    <div className="relative opacity-60">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            disabled
                                            className="w-full bg-gray-100 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-500 font-bold cursor-not-allowed" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Delivery/Business Address</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                        <textarea 
                                            rows={3}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50">
                                    <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-orange-500" /> Change Password
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input 
                                            type="password" 
                                            placeholder="New Password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                                        />
                                        <input 
                                            type="password" 
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                                        />
                                    </div>
                                    <p className="mt-3 text-[10px] text-gray-400 font-bold px-2 uppercase">Leave blank to keep your current password</p>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="w-full py-5 bg-gray-900 text-white font-black rounded-[1.5rem] hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? "Saving Changes..." : <><Save className="h-5 w-5" /> Update Profile</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
