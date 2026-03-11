"use client";

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ item }: { item: any }) {
    const { addToCart } = useCart();
    return (
        <button
            onClick={() => addToCart(item)}
            className="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-600 hover:text-white font-bold rounded-lg transition-colors text-sm whitespace-nowrap"
        >
            Add to Cart
        </button>
    );
}
