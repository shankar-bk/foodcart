import Link from "next/link";
import { Sparkles, ArrowRight, Star, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import dbConnect from "@/lib/db";
import { Restaurant } from "@/models/Restaurant";

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();
  // Fetch a subset of restaurants to feature on the homepage
  let restaurants: any[] = [];
  try {
    restaurants = await Restaurant.find({}).limit(6).lean();
  } catch (e) { }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* simple pattern overlay */}
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10 flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Craving something? <br />
              <span className="text-orange-200">Just ask the AI.</span>
            </h1>
            <p className="text-lg sm:text-xl font-medium mb-8 max-w-lg text-orange-100">
              Skip the endless scrolling. Tell our AI what you want, how much you want to spend, and we'll build your order instantly.
            </p>
            <div className="flex gap-4">
              <Link href="/chat" className="bg-white text-orange-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold text-lg transition flex items-center gap-2 shadow-sm">
                <Sparkles className="w-5 h-5" /> Order with AI
              </Link>
              <Link href="/restaurants" className="border-2 border-white/30 hover:border-white text-white px-6 py-3 rounded-lg font-bold text-lg transition flex items-center gap-2">
                Browse Menu <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="lg:w-1/3 w-full max-w-md bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="text-sm font-medium mb-2 opacity-80">Example prompt:</div>
            <div className="bg-white/20 p-4 rounded-lg italic text-lg mb-4">
              "I want a spicy chicken pizza around ₹400 from a top-rated place."
            </div>
            <div className="flex items-center gap-2 border-t border-white/20 pt-4 text-sm mt-4">
              <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span>AI returns exactly what you asked for.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Restaurants (Preview) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular right now</h2>
          <Link href="/restaurants" className="text-orange-600 hover:underline font-medium">View all</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((rest: any) => (
            <div key={rest._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img
                  src={`https://source.unsplash.com/800x600/?${encodeURIComponent(rest.cuisine || 'restaurant,food')}`}
                  alt={rest.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{rest.name}</h3>
                <div className="flex items-center text-gray-500 mb-4 text-sm gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" /> {rest.rating || 'New'}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {rest.location}
                  </div>
                </div>
                <Link href={`/restaurants/${rest._id}`} className="block w-full text-center py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition">
                  View Menu
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
