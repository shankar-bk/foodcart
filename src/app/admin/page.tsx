"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Users, Store, Bike, PieChart, ShieldBan, ShieldCheck } from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        // Extra secure check: Role must be admin
        if (session?.user && session.user.role !== "admin") {
            router.push("/");
        } else {
            fetchAdminData();
        }
    }, [session, status]);

    const fetchAdminData = async () => {
        try {
            const res = await axios.get("/api/admin/data");
            setStats(res.data.stats);
            setUsers(res.data.users);
        } catch (e) { }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            await axios.put("/api/admin/data", { userId, role: newRole });
            fetchAdminData();
        } catch (e) {
            alert("Failed to update user");
        }
    };

    if (status === "loading" || !stats) return <div className="p-10 text-center">Loading admin portal...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 px-2">Manage Platform</h2>
                        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'overview' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <PieChart className="w-5 h-5" /> Overview
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'users' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Users className="w-5 h-5" /> All Users
                        </button>
                        <button onClick={() => setActiveTab('restaurants')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'restaurants' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Store className="w-5 h-5" /> Restaurants
                        </button>
                        <button onClick={() => setActiveTab('delivery')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'delivery' ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Bike className="w-5 h-5" /> Delivery Agents
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">

                    {activeTab === 'overview' && (
                        <>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Platform Analytics</h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <p className="text-gray-500 font-medium mb-1">Total Orders</p>
                                    <h3 className="text-3xl font-black text-gray-900">{stats.totalOrders}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <p className="text-gray-500 font-medium mb-1">Revenue</p>
                                    <h3 className="text-3xl font-black text-orange-600">${stats.revenue.toFixed(2)}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <p className="text-gray-500 font-medium mb-1">Restaurants</p>
                                    <h3 className="text-3xl font-black text-gray-900">{stats.restaurantCount}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <p className="text-gray-500 font-medium mb-1">Customers</p>
                                    <h3 className="text-3xl font-black text-gray-900">{stats.customerCount}</h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex items-center justify-center">
                                <p className="text-gray-400 font-medium flex flex-col items-center gap-2">
                                    <PieChart className="w-16 h-16 text-gray-200" />
                                    Detailed charts will be generated here
                                </p>
                            </div>
                        </>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">User Management</h1>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                                            <th className="p-4 font-bold">Name</th>
                                            <th className="p-4 font-bold">Email</th>
                                            <th className="p-4 font-bold">Role</th>
                                            <th className="p-4 font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="p-4 font-bold text-gray-900">{u.name}</td>
                                                <td className="p-4 text-gray-600">{u.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider
                                  ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                            u.role === 'restaurant' ? 'bg-blue-100 text-blue-700' :
                                                                u.role === 'delivery' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-green-100 text-green-700'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => updateUserRole(u._id, e.target.value)}
                                                        className="text-sm bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none"
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="restaurant">Restaurant</option>
                                                        <option value="delivery">Delivery</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Same concepts apply for Restaurants and Delivery Agents tabs */}
                    {(activeTab === 'restaurants' || activeTab === 'delivery') && (
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Filter View</h2>
                            <p className="text-gray-500">This view filters the User Management table specifically for active {activeTab}.</p>
                            <button onClick={() => setActiveTab('users')} className="mt-4 text-orange-600 font-bold hover:underline">Go to Users</button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
