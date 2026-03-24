"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Bike, MapPin, CheckCircle, Navigation, Power, Wallet, ShieldCheck, Lock, Store } from "lucide-react";
import axios from "axios";
import DeliveryMap from "@/components/DeliveryMap";

export default function DeliveryDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [isOnline, setIsOnline] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [earnings, setEarnings] = useState({ total: 0, count: 0 });
    const [lastToggleTime, setLastToggleTime] = useState(0);
    const [loading, setLoading] = useState(true);

    const [pins, setPins] = useState<Record<string, string>>({}); // { orderId: pinValue }

    const fetchDashboardData = useCallback(async (isInitial = false) => {
        try {
            const res = await axios.get("/api/delivery/orders");
            setAvailableOrders(res.data.available);
            setMyDeliveries(res.data.myDeliveries);
            
            // Grace period of 2 seconds after a manual toggle to avoid stale DB reads
            const now = Date.now();
            if (isInitial || (!isToggling && (now - lastToggleTime > 2000))) {
                setIsOnline(res.data.isOnline);
            }
            
            setEarnings({ total: res.data.totalEarnings, count: res.data.completedCount });
        } catch (e) {
            console.error("Dashboard fetch error:", e);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [isToggling, lastToggleTime]);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (session && session.user?.role !== "delivery" && session.user?.role !== "admin") {
            router.push("/");
        } else if (session) {
            fetchDashboardData(true);
            
            // Auto refresh every 5 seconds
            const interval = setInterval(() => fetchDashboardData(), 5000);
            return () => clearInterval(interval);
        }
    }, [session, status, fetchDashboardData]);

    const toggleOnlineStatus = async () => {
        const targetStatus = !isOnline;
        setIsToggling(true);
        setIsOnline(targetStatus); // Optimistic UI
        setLastToggleTime(Date.now());
        
        try {
            const res = await axios.put("/api/delivery/status", { isOnline: targetStatus });
            // Sync with server response
            setIsOnline(res.data.isOnline);
        } catch (e) {
            // Revert on failure
            setIsOnline(!targetStatus);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsToggling(false);
            setLastToggleTime(Date.now()); // Reset grace period after completion
        }
    };

    const acceptOrder = async (orderId: string) => {
        try {
            await axios.put(`/api/delivery/orders`, { orderId, action: 'accept' });
            fetchDashboardData();
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to accept order");
        }
    };

    const updateStatusWithPin = async (orderId: string, newStatus: string) => {
        const pin = pins[orderId];
        if (!pin || pin.length !== 4) {
            alert("Please enter a valid 4-digit PIN");
            return;
        }

        try {
            await axios.put(`/api/delivery/orders`, { orderId, action: 'status', status: newStatus, pin });
            fetchDashboardData();
            // Clear pin
            setPins(prev => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });
        } catch (e: any) {
            alert(e.response?.data?.error || "Invalid PIN or update failed");
        }
    };

    if (status === "loading" || (loading && !session)) return <div className="p-10 text-center text-orange-600 font-bold">Connecting to delivery network...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header & Status Toggle */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Bike className="h-8 w-8 text-orange-600" /> Rider Dashboard
                        </h1>
                        <p className="text-gray-500 font-medium">Manage your deliveries and track earnings</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
                        <div className="flex-1 px-4">
                            <p className="text-[10px] font-black uppercase text-gray-400">Current Status</p>
                            <p className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </p>
                        </div>
                        <button 
                            disabled={isToggling}
                            onClick={toggleOnlineStatus}
                            className={`p-3 rounded-xl transition-all shadow-md active:scale-95 ${isToggling ? 'opacity-50 cursor-not-allowed' : ''} ${isOnline ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                            <Power className={`h-6 w-6 ${isToggling ? 'animate-pulse' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Earnings Ribbon */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-orange-600 text-white p-6 rounded-3xl shadow-xl shadow-orange-100 flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 font-bold text-sm uppercase">Total Earnings</p>
                            <h2 className="text-4xl font-black italic">₹{earnings.total}</h2>
                        </div>
                        <Wallet className="h-12 w-12 opacity-30" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                         <div>
                            <p className="text-gray-400 font-bold text-sm uppercase">Completed</p>
                            <h2 className="text-4xl font-black text-gray-900">{earnings.count} <span className="text-xl">trips</span></h2>
                        </div>
                        <CheckCircle className="h-12 w-12 text-green-100" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                         <div>
                            <p className="text-gray-400 font-bold text-sm uppercase">Rider Rating</p>
                            <h2 className="text-4xl font-black text-gray-900">4.9 <span className="text-xl">★</span></h2>
                        </div>
                        <ShieldCheck className="h-12 w-12 text-blue-100" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Available Orders */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Orders Pool</h2>
                            <span className="bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-full">{availableOrders.length} New</span>
                        </div>

                        {!isOnline ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Power className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Go online to see available orders</p>
                            </div>
                        ) : availableOrders.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-10">Searching for new orders near you...</p>
                        ) : (
                            <div className="space-y-4">
                                {availableOrders.map((order: any) => (
                                    <div key={order._id} className="p-5 border border-gray-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-black text-gray-900">
                                                    {order.restaurantId?.name || "Premium Restaurant"}
                                                </h3>
                                                <p className="text-xs text-orange-600 font-black uppercase tracking-wider">₹{order.deliveryEarnings} GUARANTEED PAYOUT</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-black text-xl text-gray-900">₹{order.totalAmount}</span>
                                                <p className="text-[10px] text-gray-400 font-bold">ORDER VAL</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                <Navigation className="h-4 w-4 text-orange-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 truncate">{order.deliveryLocation}</p>
                                        </div>

                                        <button
                                            onClick={() => acceptOrder(order._id)}
                                            className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
                                        >
                                            Accept Task
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Active Deliveries */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">In-Progress Tasks</h2>

                        {myDeliveries.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                                <Bike className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No active deliveries. Pick one from the pool!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myDeliveries.map((order: any) => (
                                    <div key={order._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden group transition-all hover:shadow-2xl hover:shadow-orange-100/50">
                                        {/* MAP SECTION */}
                                        <DeliveryMap 
                                            restaurantName={order.restaurantId?.name} 
                                            deliveryLocation={order.deliveryLocation}
                                            status={order.orderStatus}
                                        />

                                        <div className="p-8">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Active Trip Pay</p>
                                                    <h3 className="text-4xl font-black text-gray-900 italic">₹{order.deliveryEarnings}</h3>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full border border-orange-200">
                                                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{order.orderStatus.replace('_', ' ')}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold">#{order._id.substring(order._id.length - 6)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Pickup From</p>
                                                    <div className="flex items-center gap-2">
                                                        <Store className="w-4 h-4 text-orange-500" />
                                                        <p className="font-black text-gray-900 truncate">{order.restaurantId?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">Deliver To</p>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-500" />
                                                        <p className="font-black text-gray-900 truncate">{order.deliveryLocation}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* PIN VERIFICATION SECTION */}
                                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Lock className="h-4 w-4 text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-600">
                                                        {order.orderStatus === 'ready' ? "Verify Pickup PIN" : "Verify Delivery PIN"}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="text" 
                                                        maxLength={4}
                                                        placeholder="4-digit PIN"
                                                        value={pins[order._id] || ""}
                                                        onChange={(e) => setPins(prev => ({ ...prev, [order._id]: e.target.value }))}
                                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-center font-black tracking-[0.5em] focus:outline-none text-lg text-black"
                                                    />
                                                    <button 
                                                        onClick={() => updateStatusWithPin(order._id, order.orderStatus === 'ready' ? 'out_for_delivery' : 'delivered')}
                                                        className="bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-100 active:scale-95"
                                                    >
                                                        <ShieldCheck className="h-6 w-6" />
                                                    </button>
                                                </div>
                                                <p className="mt-3 text-[10px] text-gray-400 italic">
                                                    {order.orderStatus === 'ready' 
                                                        ? "Ask restaurant for their 4-digit pickup code" 
                                                        : "Ask customer for their 4-digit verification code"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
