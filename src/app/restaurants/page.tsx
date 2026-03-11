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
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col"
                            >
                                <div className="h-48 bg-orange-100 flex items-center justify-center relative overflow-hidden">
                                    <Utensils className="h-12 w-12 text-orange-300 group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        {restaurant.rating?.toFixed(1) || "New"}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{restaurant.name}</h3>
                                    <div className="flex items-center text-gray-500 text-sm mb-4">
                                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                        <span className="truncate">{restaurant.location}</span>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="flex flex-wrap gap-2">
                                            {restaurant.cuisine?.slice(0, 3).map((c: string) => (
                                                <span key={c} className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                                    {c}
                                                </span>
                                            ))}
                                            {restaurant.cuisine?.length > 3 && (
                                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                                    +{restaurant.cuisine.length - 3}
                                                </span>
                                            )}
                                        </div>
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
