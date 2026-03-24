"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Utensils, ClipboardList, TrendingUp, Plus, CheckCircle, XCircle, Edit, Trash2, User, Camera, MapPin, Save, Sparkles } from "lucide-react";
import axios from "axios";

export default function RestaurantDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [restaurant, setRestaurant] = useState<any>(null);

    // Profile Form
    const [resName, setResName] = useState("");
    const [resLocation, setResLocation] = useState("");
    const [resCuisine, setResCuisine] = useState("");
    const [resImage, setResImage] = useState("");

    // Menu Form
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [veg, setVeg] = useState(true);
    const [itemImage, setItemImage] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (session?.user?.role !== "restaurant" && session?.user?.role !== "admin") {
            router.push("/");
        } else {
            fetchOrders();
            fetchMenu();
            fetchProfile();
        }
    }, [session, status]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/api/restaurant/profile");
            setRestaurant(res.data);
            if (res.data) {
                setResName(res.data.name || "");
                setResLocation(res.data.location || "");
                setResCuisine(res.data.cuisine?.join(", ") || "");
                setResImage(res.data.image || "");
            }
        } catch (e) { }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put("/api/restaurant/profile", {
                name: resName,
                location: resLocation,
                cuisine: resCuisine.split(",").map(c => c.trim()),
                image: resImage
            });
            fetchProfile();
            alert("Profile updated!");
        } catch (e) {
            alert("Failed to update profile");
        }
    };

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

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'res' | 'item') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage
            alert("Image too large! Please use a file smaller than 1MB.");
            return;
        }
        const base64 = await convertToBase64(file);
        if (target === 'res') setResImage(base64);
        else setItemImage(base64);
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
            const payload = {
                name,
                price: Number(price),
                description,
                veg,
                image: itemImage
            };
            if (editingId) {
                await axios.put(`/api/restaurant/menu/${editingId}`, payload);
                setEditingId(null);
            } else {
                await axios.post("/api/restaurant/menu", payload);
            }
            setName(""); setPrice(""); setDescription(""); setItemImage(""); setVeg(true);
            fetchMenu();
        } catch (e) {
            alert("Failed to save item");
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        setName(item.name);
        setPrice(item.price.toString());
        setDescription(item.description);
        setVeg(item.veg);
        setItemImage(item.image || "");
        setActiveTab("menu");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await axios.delete(`/api/restaurant/menu/${id}`);
            fetchMenu();
        } catch (e) {
            alert("Failed to delete item");
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
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2 ${activeTab === 'profile' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <User className="h-5 w-5" /> Restaurant Profile
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
                                        <p className="text-gray-500 text-sm">Amount: ₹{order.totalAmount} • Status: <span className="font-bold text-orange-600">{order.orderStatus.toUpperCase()}</span></p>
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
                                            <button onClick={() => handleUpdateOrderStatus(order._id, 'ready')} className="flex-1 md:flex-none px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-lg transition-all active:scale-95 shadow-sm">
                                                Mark Ready
                                            </button>
                                        )}
                                        {(order.orderStatus === 'accepted' || order.orderStatus === 'preparing' || order.orderStatus === 'ready') && (
                                            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex flex-col items-center">
                                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Pickup PIN</span>
                                                <span className="text-xl font-black text-orange-600 tracking-widest">{order.restaurantPin}</span>
                                            </div>
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
                                {editingId ? <Edit className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-orange-600" />}
                                {editingId ? "Edit Menu Item" : "Add New Item"}
                            </h3>
                            <form onSubmit={handleAddMenuItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Item Name</label>
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                    <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-20 text-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
                                    <div className="flex items-center gap-4">
                                        {itemImage && (
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                                <img src={itemImage} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => handleImageUpload(e, 'item')}
                                            className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" 
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" checked={veg} onChange={e => setVeg(e.target.checked)} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded text-black" />
                                    <label className="ml-2 block text-sm text-gray-900">Vegetarian</label>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className={`flex-1 py-2 text-white font-bold rounded-lg transition ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                                        {editingId ? "Update Item" : "Save Item"}
                                    </button>
                                    {editingId && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setEditingId(null);
                                                setName(""); setPrice(""); setDescription(""); setVeg(true); setItemImage("");
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Current Menu</h3>
                            {menu.length === 0 ? <p className="text-gray-500">Menu is empty.</p> : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {menu.map((item: any) => (
                                        <div key={item._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start group relative">
                                            <div className="flex gap-3">
                                                {item.image && (
                                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">₹{item.price}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${item.veg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {item.veg ? 'Veg' : 'Non-Veg'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit Item"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete Item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-orange-50">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <Sparkles className="h-6 w-6 text-yellow-500" /> Restaurant Branding
                            </h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Restaurant Name</label>
                                        <input 
                                            type="text" 
                                            value={resName} 
                                            onChange={e => setResName(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            placeholder="e.g. Spice Route"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Cuisines (Comma separated)</label>
                                        <input 
                                            type="text" 
                                            value={resCuisine} 
                                            onChange={e => setResCuisine(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            placeholder="North Indian, Chinese, Mughlai"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Business Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <input 
                                            type="text" 
                                            value={resLocation} 
                                            onChange={e => setResLocation(e.target.value)} 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                            placeholder="Street Number, Area, City"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Brand Cover Image</label>
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-8 text-center relative overflow-hidden group">
                                        {resImage ? (
                                            <div className="space-y-4">
                                                <img src={resImage} alt="Cover" className="max-h-48 rounded-2xl mx-auto shadow-lg" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setResImage("")}
                                                    className="text-xs font-bold text-red-500 hover:text-red-700 underline"
                                                >
                                                    Remove and upload different image
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                    <Camera className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-700">Drop your brand banner here</p>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 1MB</p>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={(e) => handleImageUpload(e, 'res')}
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full py-5 bg-orange-600 text-white font-black rounded-3xl hover:bg-orange-700 transition-all active:scale-[0.98] shadow-xl shadow-orange-100 flex items-center justify-center gap-3"
                                >
                                    <Save className="h-5 w-5" /> Save Branding Changes
                                </button>
                            </form>
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
