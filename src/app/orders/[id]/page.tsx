"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import { Clock, CheckCircle, Package, Bike, MapPin } from "lucide-react";
import axios from "axios";

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`/api/orders/${id}`);
            setOrder(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();

        // Polling every 5 seconds for real-time updates since Pusher API keys aren't guaranteed
        const interval = setInterval(() => {
            fetchOrder();
        }, 5000);

        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="p-10 text-center text-orange-600">Loading tracking details...</div>;
    if (!order) return <div className="p-10 text-center">Order not found.</div>;

    const statuses = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    const currentIndex = statuses.indexOf(order.orderStatus);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Tracking</h1>
                        <p className="text-gray-500 font-medium">Order #{order._id.substring(order._id.length - 8)}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative mb-12">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                        ></div>

                        <div className="relative z-10 flex justify-between">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentIndex >= 0 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'} transition-colors shadow-sm`}>
                                    <Clock className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold mt-2 text-gray-600">Placed</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentIndex >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'} transition-colors shadow-sm`}>
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold mt-2 text-gray-600">Preparing</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentIndex >= 4 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'} transition-colors shadow-sm`}>
                                    <Bike className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold mt-2 text-gray-600">Out</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentIndex >= 5 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'} transition-colors shadow-sm`}>
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold mt-2 text-gray-600">Delivered</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Notice & Real-time Map Sim */}
                    <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex flex-col items-center text-center">
                        {order.orderStatus === 'delivered' ? (
                            <>
                                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900">Enjoy your meal!</h2>
                                <p className="text-gray-600 mt-2">Your order has been delivered.</p>
                            </>
                        ) : order.orderStatus === 'out_for_delivery' ? (
                            <>
                                <div className="w-full h-48 bg-gray-200 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center">
                                    <MapPin className="text-orange-500 w-12 h-12 absolute z-10 animate-bounce" />
                                    <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=14&size=600x300&key=NO_KEY')] bg-cover opacity-50 filter blur-[2px]"></div>
                                    <span className="relative z-10 bg-white/90 backdrop-blur px-3 py-1 font-bold text-gray-700 rounded-full shadow-sm text-sm">Live GPS Tracking (Simulated)</span>
                                </div>
                                <div className="mb-6 bg-orange-600 text-white p-6 rounded-[2rem] shadow-xl shadow-orange-100 flex flex-col items-center">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-80">Your Delivery PIN</span>
                                    <span className="text-5xl font-black tracking-[0.3em] ml-[0.3em]">{order.customerPin}</span>
                                    <p className="mt-4 text-[10px] font-bold opacity-70">Share this with the rider only after receiving your food</p>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Your driver is arriving soon!</h2>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-gray-900">Preparing your order</h2>
                                <p className="text-gray-600 mt-2">The restaurant is cooking up your delicious food.</p>
                            </>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
