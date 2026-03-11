"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Utensils, ClipboardList, TrendingUp, Plus, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

export default function RestaurantDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);

    // Menu Form
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [veg, setVeg] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (session?.user?.role !== "restaurant" && session?.user?.role !== "admin") {
            router.push("/");
        } else {
            fetchOrders();
            fetchMenu();
        }
    }, [session, status]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get("/api/restaurant/orders");
            setOrders(res.data);
        } catch (e) { }
    };

    const fetchMenu = async () => {
        try {
            const res = await axios.get("/api/restaurant/menu");
            setMenu(res.data);
        } catch (e) { }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await axios.put(`/api/restaurant/orders`, { orderId, status: newStatus });
            fetchOrders();
        } catch (e) {
            alert("Failed to update status");
        }
    };

    const handleAddMenuItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post("/api/restaurant/menu", { name, price: Number(price), description, veg });
            setName(""); setPrice(""); setDescription("");
            fetchMenu();
        } catch (e) {
            alert("Failed to add item");
        }
    };

    if (status === "loading") return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Restaurant Dashboard</h1>

                <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 ${activeTab === 'orders' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ClipboardList className="h-5 w-5" /> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab("menu")}
                        className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 ${activeTab === 'menu' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Utensils className="h-5 w-5" /> Menu Details
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <TrendingUp className="h-5 w-5" /> Analytics
                    </button>
                </div>

                {activeTab === "orders" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                        {orders.length === 0 ? (
                            <p className="text-gray-500">No active orders right now.</p>
                        ) : (
                            orders.map((order: any) => (
                                <div key={order._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">Order #{order._id.substring(order._id.length - 6)}</h3>
                                        <p className="text-gray-500 text-sm">Amount: ${order.totalAmount} • Status: <span className="font-bold text-orange-600">{order.orderStatus.toUpperCase()}</span></p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {order.items.map((item: any) => (
                                                <span key={item.menuItemId?._id || Math.random()} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                                    {item.quantity}x {item.menuItemId?.name || 'Item'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        {order.orderStatus === 'placed' && (
                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'accepted')} className="flex-1 md:flex-none px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-bold rounded-lg flex justify-center items-center gap-1">
                                                <CheckCircle className="h-4 w-4" /> Accept
                                            </button>
                                        )}
                                        {(order.orderStatus === 'accepted' || order.orderStatus === 'preparing') && (
                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'ready')} className="flex-1 md:flex-none px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-lg">
                                                Mark Ready
                                            </button>
                                        )}
                                        {order.orderStatus === 'placed' && (
                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')} className="flex-1 md:flex-none px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-lg flex justify-center items-center gap-1">
                                                <XCircle className="h-4 w-4" /> Reject
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "menu" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Plus className="h-5 w-5 text-orange-600" /> Add New Item
                            </h3>
                            <form onSubmit={handleAddMenuItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                                    <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-20" />
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" checked={veg} onChange={e => setVeg(e.target.checked)} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                                    <label className="ml-2 block text-sm text-gray-900">Vegetarian</label>
                                </div>
                                <button type="submit" className="w-full py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition">Save Item</button>
                            </form>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Current Menu</h3>
                            {menu.length === 0 ? <p className="text-gray-500">Menu is empty.</p> : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {menu.map((item: any) => (
                                        <div key={item._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-500">${item.price}</p>
                                                <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${item.veg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item.veg ? 'Veg' : 'Non-Veg'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                        <TrendingUp className="h-16 w-16 text-orange-200 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h3>
                        <p className="text-gray-500 mt-2">Come back later once you have more orders to see your daily sales and popular dishes!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
