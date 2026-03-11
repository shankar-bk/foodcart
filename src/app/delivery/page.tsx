"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Bike, MapPin, CheckCircle, Navigation } from "lucide-react";
import axios from "axios";

export default function DeliveryDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (session?.user?.role !== "delivery" && session?.user?.role !== "admin") {
            router.push("/");
        } else {
            fetchOrders();
        }
    }, [session, status]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get("/api/delivery/orders");
            setAvailableOrders(res.data.available);
            setMyDeliveries(res.data.myDeliveries);
        } catch (e) { }
    };

    const calculateDistance = () => {
        // Mock distance
        return (Math.random() * 5 + 1).toFixed(1);
    };

    const acceptOrder = async (orderId: string) => {
        try {
            await axios.put(`/api/delivery/orders`, { orderId, action: 'accept' });
            fetchOrders();
        } catch (e) {
            alert("Failed to accept order");
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await axios.put(`/api/delivery/orders`, { orderId, action: 'status', status: newStatus });
            fetchOrders();
        } catch (e) {
            alert("Failed to update status");
        }
    };

    if (status === "loading") return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                    <Bike className="h-8 w-8 text-orange-600" /> Delivery Agent Portal
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Available Orders */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Available for Pickup</h2>

                        {availableOrders.length === 0 ? (
                            <p className="text-gray-500 italic">No orders ready for pickup at the moment.</p>
                        ) : (
                            <div className="space-y-4">
                                {availableOrders.map((order: any) => (
                                    <div key={order._id} className="p-4 border border-gray-100 bg-gray-50 rounded-xl hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">
                                                    Restaurant: {order.restaurantId?.name || "Unknown"}
                                                </h3>
                                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                                    <Navigation className="h-4 w-4 text-orange-500" />
                                                    Drop: {order.deliveryLocation}
                                                </p>
                                            </div>
                                            <span className="font-black text-lg text-gray-900">${order.totalAmount}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4">{calculateDistance()} km away</p>
                                        <button
                                            onClick={() => acceptOrder(order._id)}
                                            className="w-full py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition"
                                        >
                                            Accept Delivery
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Active Deliveries */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">My Active Deliveries</h2>

                        {myDeliveries.length === 0 ? (
                            <p className="text-gray-500 italic">You don't have any active deliveries.</p>
                        ) : (
                            <div className="space-y-4">
                                {myDeliveries.map((order: any) => (
                                    <div key={order._id} className="p-5 border-2 border-orange-100 bg-orange-50/30 rounded-xl">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                                {order.orderStatus.replace('_', ' ')}
                                            </span>
                                            <span className="text-sm font-bold text-gray-700">Order #{order._id.substring(order._id.length - 6)}</span>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-800"><span className="font-bold text-gray-500">Pickup:</span> {order.restaurantId?.name}</p>
                                            <p className="text-sm text-gray-800"><span className="font-bold text-gray-500">Dropoff:</span> {order.deliveryLocation}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {order.orderStatus === 'ready' && (
                                                <button onClick={() => updateStatus(order._id, 'out_for_delivery')} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm">
                                                    Picked Up
                                                </button>
                                            )}
                                            {order.orderStatus === 'out_for_delivery' && (
                                                <button onClick={() => updateStatus(order._id, 'delivered')} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1 text-sm">
                                                    <CheckCircle className="h-4 w-4" /> Mark Delivered
                                                </button>
                                            )}
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
