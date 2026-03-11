"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User as UserIcon, LogOut, Sparkles, Home, List, Shield, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const { cart } = useCart();
    const pathname = usePathname();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            {/* Top Navbar (Slimmer on mobile, full on desktop) */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 sm:h-16 items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                            <span className="text-xl sm:text-2xl font-black text-orange-600 tracking-tighter">FoodCart</span>
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                        </Link>

                        <div className="flex items-center gap-4 sm:gap-6">
                            {session ? (
                                <>
                                    {/* Desktop Links (Hidden on small mobile) */}
                                    <div className="hidden sm:flex items-center gap-6">
                                        <Link href="/chat" className="text-gray-700 hover:text-orange-600 font-medium flex items-center gap-1 transition-colors">
                                            <Sparkles className="h-4 w-4" /> AI Order
                                        </Link>

                                        {session.user.role === 'customer' && (
                                            <Link href="/cart" className="text-gray-700 hover:text-orange-600 relative transition-colors">
                                                <ShoppingCart className="h-6 w-6" />
                                                {cartCount > 0 && (
                                                    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                        {cartCount}
                                                    </span>
                                                )}
                                            </Link>
                                        )}

                                        {session.user.role === 'restaurant' && (
                                            <Link href="/restaurant" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                                                Dashboard
                                            </Link>
                                        )}
                                        {session.user.role === 'delivery' && (
                                            <Link href="/delivery" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                                                Deliveries
                                            </Link>
                                        )}
                                        {session.user.role === 'admin' && (
                                            <Link href="/admin" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                                                Admin Dashboard
                                            </Link>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 sm:border-l sm:pl-6 border-gray-200">
                                        <div className="flex flex-col items-end hidden sm:flex">
                                            <span className="text-sm font-bold text-gray-900 leading-tight">{session.user.name?.split(' ')[0]}</span>
                                            <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider hidden sm:block">{session.user.role}</span>
                                        </div>
                                        <button
                                            onClick={() => signOut()}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors bg-gray-50 sm:bg-transparent"
                                            title="Logout"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-600 hover:text-gray-900 font-bold transition-colors text-sm sm:text-base">
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-orange-600 text-white px-4 py-2 sm:px-5 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm text-sm sm:text-base"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom App Navigation (Visible ONLY on small screens for Customer) */}
            {session?.user?.role === 'customer' && (
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
                    <div className="flex justify-around items-end h-16 pb-2 px-2">
                        <Link href="/" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${pathname === '/' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>
                            <Home className={`h-6 w-6 ${pathname === '/' ? 'fill-orange-100' : ''}`} />
                            <span className="text-[10px] font-bold">Home</span>
                        </Link>

                        <Link href="/restaurants" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${pathname === '/restaurants' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>
                            <List className="h-6 w-6" />
                            <span className="text-[10px] font-bold">Browse</span>
                        </Link>

                        {/* Centered Floating AI Button */}
                        <div className="relative flex-1 flex justify-center h-full">
                            <Link href="/chat" className={`absolute -top-6 flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-xl border-4 border-gray-50 transition-transform active:scale-95 ${pathname === '/chat' ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'}`}>
                                <Sparkles className="h-6 w-6" />
                            </Link>
                        </div>

                        <Link href="/cart" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${pathname === '/cart' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>
                            <div className="relative">
                                <ShoppingCart className={`h-6 w-6 ${pathname === '/cart' ? 'fill-orange-100' : ''}`} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center outline outline-2 outline-white">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold">Cart</span>
                        </Link>

                        <Link href="/profile" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${pathname === '/profile' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}>
                            <UserIcon className="h-6 w-6" />
                            <span className="text-[10px] font-bold">Profile</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Mobile Bottom App Navigation for non-customers */}
            {session && session.user.role !== 'customer' && (
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
                    <div className="flex justify-around items-end h-16 pb-2 px-2">
                        <Link href="/" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${pathname === '/' ? 'text-orange-600' : 'text-gray-400'}`}>
                            <Home className="h-6 w-6" />
                            <span className="text-[10px] font-bold">Menu Site</span>
                        </Link>
                        {session.user.role === 'restaurant' && (
                            <Link href="/restaurant" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${pathname.includes('/restaurant') && pathname !== '/restaurants' ? 'text-orange-600' : 'text-gray-400'}`}>
                                <List className="h-6 w-6" />
                                <span className="text-[10px] font-bold">Dashboard</span>
                            </Link>
                        )}
                        {session.user.role === 'delivery' && (
                            <Link href="/delivery" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${pathname.includes('/delivery') ? 'text-orange-600' : 'text-gray-400'}`}>
                                <Truck className="h-6 w-6" />
                                <span className="text-[10px] font-bold">Portal</span>
                            </Link>
                        )}
                        {session.user.role === 'admin' && (
                            <Link href="/admin" className={`flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all ${pathname.includes('/admin') ? 'text-orange-600' : 'text-gray-400'}`}>
                                <Shield className="h-6 w-6" />
                                <span className="text-[10px] font-bold">Admin</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
