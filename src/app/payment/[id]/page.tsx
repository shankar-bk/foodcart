"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { CheckCircle, ShieldCheck, Smartphone, RefreshCw } from "lucide-react";
import axios from "axios";
import { useCart } from "@/context/CartContext";

export default function DummyPaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { clearCart } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
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
        fetchOrder();
    }, [id]);

    const handleConfirmPayment = async () => {
        setProcessing(true);
        try {
            // Simulate a short network delay
            await new Promise(r => setTimeout(r, 1500));
            
            await axios.put("/api/checkout", {
                orderId: id,
                paymentId: "dummy_qr_" + Date.now()
            });
            
            clearCart();
            router.push(`/orders/${id}`);
        } catch (e) {
            alert("Payment failed. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-orange-600 font-bold flex flex-col items-center gap-4">
        <RefreshCw className="animate-spin h-10 w-10" />
        Initializing secure payment gateway...
    </div>;

    if (!order) return <div className="p-10 text-center font-bold">Order not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden text-center p-8 sm:p-12 relative">
                    {/* Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-orange-600"></div>

                    <h1 className="text-3xl font-black text-gray-900 mb-2">Secure Checkout</h1>
                    <p className="text-gray-500 font-medium mb-8">Scan QR code to pay via UPI</p>

                    {/* QR Code Simulation Area */}
                    <div className="relative mx-auto w-64 h-64 bg-gray-50 rounded-3xl border-4 border-orange-50 flex items-center justify-center mb-8 p-4 group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img 
                            src="/qr-mockup.png" 
                            alt="Scan to Pay" 
                            className="w-full h-full rounded-xl opacity-90 group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-12">
                            <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                                <ShieldCheck className="text-orange-600 w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-50/50 rounded-2xl p-6 mb-8 border border-orange-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600 font-medium italic">Amount to pay</span>
                            <span className="text-2xl font-black text-gray-900">₹{order.totalAmount}</span>
                        </div>
                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest text-left">Transaction ID: TXN-{id.substring(0, 10).toUpperCase()}</p>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={handleConfirmPayment}
                            disabled={processing}
                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <RefreshCw className="animate-spin h-5 w-5" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Smartphone className="h-5 w-5" />
                                    I have paid via UPI
                                </>
                            )}
                        </button>
                        
                        <p className="text-xs text-gray-400 font-medium">Your payment is 100% secure and encrypted.</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-6 opacity-30 grayscale pointer-events-none">
                   {/* Dummy Payment Logos */}
                   <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/GPay_logo.svg" alt="GPay" className="h-4" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-4" />
                </div>
            </main>
        </div>
    );
}
