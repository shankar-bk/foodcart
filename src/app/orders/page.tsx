"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ChevronRight, Clock, CheckCircle, Package, Bike } from "lucide-react";
import axios from "axios";

const statusIcons: any = {
    placed: <Clock className="w-5 h-5 text-blue-500" />,
    accepted: <CheckCircle className="w-5 h-5 text-green-500" />,
    preparing: <Package className="w-5 h-5 text-orange-500" />,
    ready: <CheckCircle className="w-5 h-5 text-purple-500" />,
    out_for_delivery: <Bike className="w-5 h-5 text-orange-600" />,
    delivered: <CheckCircle className="w-5 h-5 text-green-600" />,
};

export default function OrderHistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (session) fetchOrders();
    }, [session, status]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get("/api/orders");
            setOrders(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-orange-600 font-bold">Loading your delicious history...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-orange-600" />
                    My Orders
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-lg text-center">
                        <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">No orders yet!</h2>
                        <p className="text-gray-500 mt-2 mb-8">Hungry? Your first amazing meal is just a click away.</p>
                        <Link href="/restaurants" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 inline-block">
                            Browse Restaurants
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <div key={order._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{order.restaurantId?.name || "Restaurant"}</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">#{order._id.substring(order._id.length - 8)} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-xl text-gray-900">₹{order.totalAmount}</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {statusIcons[order.orderStatus] || <Clock className="w-4 h-4 text-gray-400" />}
                                            <span className="text-xs font-black uppercase text-gray-600 tracking-tight">{order.orderStatus.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-50 pt-4 flex justify-between items-center">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {/* Simple visualization of items count */}
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <Link 
                                        href={`/orders/${order._id}`}
                                        className="flex items-center gap-1 text-orange-600 font-bold hover:gap-2 transition-all group-hover:bg-orange-50 px-4 py-2 rounded-xl"
                                    >
                                        Track Order <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
