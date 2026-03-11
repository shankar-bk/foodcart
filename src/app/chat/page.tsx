"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Send, Sparkles, Bot, User } from "lucide-react";
import axios from "axios";
import { useCart } from "@/context/CartContext";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    items?: any[];
    filters?: any;
};

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hi! I'm your AI Food Assistant. What are you craving today? Tell me your preferences (e.g., 'I want a veg pizza under 250 with 4+ rating')."
        }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { addToCart } = useCart();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("/api/chat", { message: userMessage.content });

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: res.data.reply,
                items: res.data.items,
                filters: res.data.filters
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            setMessages((prev) => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error processing your request."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item: any) => {
        addToCart(item);
    };

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col h-[calc(100dvh-64px)] sm:h-[calc(100vh-64px)] pb-16 sm:pb-0 relative">

                {/* Chat Header */}
                <div className="bg-white/90 backdrop-blur border-b border-gray-100 p-3 sm:p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">FoodCart Assistant</h1>
                            <p className="text-[10px] sm:text-xs text-green-500 font-bold uppercase tracking-wider">Local AI • Qwen2.5</p>
                        </div>
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col scroll-smooth">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'}`}>

                                <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{msg.content}</p>

                                {/* Applied Filters Badge */}
                                {msg.filters && Object.keys(msg.filters).filter(k => k !== 'error').length > 0 && (
                                    <div className="mt-3 text-[10px] sm:text-xs bg-gray-50 border border-gray-100 p-2 rounded-lg text-gray-500 font-mono overflow-x-auto scrollbar-hide">
                                        Filters: {JSON.stringify(msg.filters)}
                                    </div>
                                )}

                                {/* Render Menu Items (Horizontal Scroll view) */}
                                {msg.items && msg.items.length > 0 && (
                                    <div className="mt-4 flex gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-2 sm:mx-0 sm:px-0 snap-x scrollbar-hide">
                                        {msg.items.map((item: any) => (
                                            <div key={item._id} className="min-w-[220px] max-w-[240px] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col snap-start flex-shrink-0 group">
                                                <div className="h-32 bg-gray-100 relative overflow-hidden">
                                                    <img
                                                        src={`https://source.unsplash.com/400x300/?${encodeURIComponent(item.name)}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" }}
                                                    />
                                                    <div className="absolute top-2 left-2 flex gap-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-sm backdrop-blur-md ${item.veg ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                                            {item.veg ? 'Veg' : 'Non-Veg'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 sm:p-4 flex flex-col flex-1">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 mb-1">{item.name}</h4>
                                                        <p className="text-xs text-gray-500 line-clamp-1 mb-3">{item.restaurantId?.name}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="font-black text-lg text-gray-900">${item.price}</span>
                                                        <button
                                                            onClick={() => {
                                                                handleAddToCart(item);
                                                                alert(`Added ${item.name} to cart!`);
                                                            }}
                                                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-50 text-orange-700 font-bold rounded-xl hover:bg-orange-100 transition-colors text-xs sm:text-sm active:scale-95"
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm">
                                <div className="flex gap-1.5 items-center h-5">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Sticky Input Area */}
                <div className="bg-white/90 backdrop-blur border-t border-gray-100 p-3 sm:p-4 sticky bottom-16 sm:bottom-0 z-10 sm:rounded-b-3xl">
                    {/* Prompt Suggestions (Horizontal scroll) */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
                        <button onClick={() => setInput("I want vegetarian food")} className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-200 transition active:scale-95 whitespace-nowrap">🌱 Veg options</button>
                        <button onClick={() => setInput("Show me highly rated burgers")} className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-200 transition active:scale-95 whitespace-nowrap">⭐ Top Burgers</button>
                        <button onClick={() => setInput("Cheap meals under $10")} className="flex-shrink-0 text-[10px] sm:text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-200 transition active:scale-95 whitespace-nowrap">💰 Under $10</button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message AI Assistant..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3 sm:py-4 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base text-gray-900 shadow-inner"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 disabled:opacity-50 transition shadow-sm active:scale-95"
                        >
                            <Send className="h-4 w-4 sm:h-5 sm:w-5 ml-1" />
                        </button>
                    </form>
                </div>

            </main>
        </div>
    );
}
