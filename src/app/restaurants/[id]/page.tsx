import Navbar from "@/components/Navbar";
import dbConnect from "@/lib/db";
import { Restaurant } from "@/models/Restaurant";
import { MenuItem } from "@/models/MenuItem";
import { notFound } from "next/navigation";
import { Star, MapPin, Sparkles } from "lucide-react";
import AddToCartButton from "./AddToCartButton"; // Client component wrapper

export const dynamic = 'force-dynamic';

export default async function RestaurantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    let restaurant, menuItems;
    try {
        restaurant = await Restaurant.findById(id).lean();
        if (!restaurant) return notFound();
        menuItems = await MenuItem.find({ restaurantId: id }).lean();
    } catch (e) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Restaurant Header */}
            <div className="relative h-[300px] overflow-hidden bg-gray-900 group">
                {restaurant.image ? (
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-600 opacity-80" />
                )}
                <div className="absolute inset-x-0 bottom-0 pb-10 pt-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl">{restaurant.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/90">
                                <div className="flex items-center gap-1 font-black bg-orange-600 px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg">
                                    <Star className="h-4 w-4 fill-current" /> {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}
                                </div>
                                <div className="flex items-center gap-1 font-bold">
                                    <MapPin className="h-4 w-4 text-orange-400" />
                                    {restaurant.location}
                                </div>
                                <div className="flex gap-2">
                                    {(restaurant.cuisine || []).map((c: string) => (
                                        <span key={c} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <span className="px-6 py-3 bg-white text-orange-600 font-black rounded-2xl shadow-2xl uppercase tracking-widest text-xs">Menu Site Ready</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Listing */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Menu <Sparkles className="h-5 w-5 text-orange-500" />
                </h2>

                {menuItems.length === 0 ? (
                    <p className="text-gray-500 italic">No items available yet.</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {menuItems.map((item: any) => (
                            <div key={item._id.toString()} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                        <div className={item.veg ? "w-4 h-4 rounded-sm border-2 border-green-500 flex items-center justify-center p-0.5" : "w-4 h-4 rounded-sm border-2 border-red-500 flex items-center justify-center p-0.5"}>
                                            <div className={item.veg ? "w-full h-full bg-green-500 rounded-full" : "w-full h-full bg-red-500 rounded-full"}></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                                    <p className="font-black text-lg text-gray-900">₹{item.price}</p>
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-24 h-24  object-cover rounded-xl" />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                                            IMG
                                        </div>
                                    )}
                                    {/* Needs Client Component to use CartContext */}
                                    <AddToCartButton item={{ ...item, _id: item._id.toString(), restaurantId: item.restaurantId.toString() }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
