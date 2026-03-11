"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type CartItem = {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    restaurantId: string;
};

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: any) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: any) => {
        setCart((prev) => {
            // Basic checkout restriction: items must be from the same restaurant.
            // E.g., if cart has items and the new item's restaurantId doesn't match, we could alert, 
            // but for simplicity we will just append or replace.

            const existing = prev.find((i) => i._id === item._id);
            if (existing) {
                return prev.map((i) => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            const restId = typeof item.restaurantId === 'object' ? item.restaurantId._id : item.restaurantId;
            return [...prev, { ...item, quantity: 1, restaurantId: restId }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((i) => i._id !== id));
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
