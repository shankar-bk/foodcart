import Navbar from "@/components/Navbar";
import dbConnect from "@/lib/db";
import { Restaurant } from "@/models/Restaurant";
import Link from "next/link";
import { Star, MapPin, Utensils } from "lucide-react";

export const dynamic = 'force-dynamic';

// Server component
export default async function RestaurantsPage() {
    await dbConnect();
    // Fetch all restaurants
    const restaurants = await Restaurant.find({}).lean();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Popular Restaurants</h1>

                {restaurants.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No restaurants found</h3>
                        <p className="text-gray-500 mt-2">Check back later for new additions!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant: any) => (
                            <Link
                                href={`/restaurants/${restaurant._id.toString()}`}
                                key={restaurant._id.toString()}
                                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                            >
                                <div className="h-52 bg-orange-50 relative overflow-hidden">
                                    {restaurant.image ? (
                                        <img 
                                            src={restaurant.image} 
                                            alt={restaurant.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Utensils className="h-12 w-12 text-orange-200 group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-black flex items-center gap-1 shadow-sm border border-white">
                                        <Star className="h-4 w-4 text-orange-500 fill-current" />
                                        {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : "New"}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-gray-900 mb-2 truncate group-hover:text-orange-600 transition-colors">{restaurant.name}</h3>
                                    <div className="flex items-center text-gray-400 text-xs font-bold mb-4 uppercase tracking-widest">
                                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-orange-500" />
                                        <span className="truncate">{restaurant.location}</span>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(restaurant.cuisine || []).slice(0, 2).map((c: string) => (
                                                <span key={c} className="text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-orange-600 transition-colors">View Menu →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
