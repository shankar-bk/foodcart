import { NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";
import { Restaurant } from "@/models/Restaurant";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const systemPrompt = `You are an AI Food Ordering Assistant. Your task is to extract food search filters from the user's input.
    
    RULES:
    1. If the user's input is NOT about food, ordering, restaurants, or cravings, you MUST return exactly: {"error": "Please ask questions related to food orders only."}
    2. Do NOT answer general knowledge questions, coding questions, or casual chat unrelated to food.
    3. If it IS related to food, extract the filters into a JSON object:
       - "veg": boolean (use true for vegetarian/vegan, false for non-veg. Omit if not specified)
       - "maxPrice": number (the maximum price limit. Omit if not specified)
       - "rating": number (the minimum rating limit out of 5. Omit if not specified)
       - "keywords": array of strings (the specific food names, cuisines, or main ingredients wanted. Example: ["pizza", "spicy", "burger"])
       
    Example 1:
    User: "I want a veg pizza under 250 with rating 4"
    Output: {"veg": true, "maxPrice": 250, "rating": 4, "keywords": ["pizza"]}
    
    Example 2:
    User: "Who is the president?"
    Output: {"error": "Please ask questions related to food orders only."}
    
    Return ONLY a valid JSON object. No explanation, no markdown tags. Just JSON.`;

        let filters: any = {};
        let isError = false;

        try {
            // Direct call to local Ollama instance running qwen2.5:0.5b or specified model
            const completion = await axios.post("http://localhost:11434/api/generate", {
                model: "qwen2.5:0.5b",
                system: systemPrompt,
                prompt: message,
                stream: false,
                format: "json",
                options: {
                    temperature: 0.1 // Low temp for more consistent JSON structure
                }
            });

            const responseText = completion.data.response.trim();
            filters = JSON.parse(responseText);

            if (filters && filters.error) {
                return NextResponse.json({
                    reply: filters.error,
                    filters: null,
                    items: []
                });
            }

        } catch (apiError) {
            console.error("Ollama API Error:", apiError);
            return NextResponse.json({ error: "Failed to connect to local AI engine." }, { status: 500 });
        }

        try {
            await dbConnect();
            Restaurant.init(); // ensure Restaurant is registered before populate

            // Strict MongoDB Query Construction
            const query: any = {};

            if (filters.veg === true || filters.veg === false) {
                query.veg = filters.veg;
            }
            if (typeof filters.maxPrice === 'number') {
                query.price = { $lte: filters.maxPrice };
            }
            if (typeof filters.rating === 'number') {
                query.rating = { $gte: filters.rating };
            }
            if (filters.keywords && Array.isArray(filters.keywords) && filters.keywords.length > 0) {
                // Build a robust regex search against name or description
                const keywordRegex = filters.keywords.map((kw: string) => `(?=.*${kw})`).join("");
                query.$or = [
                    { name: { $regex: new RegExp(filters.keywords.join("|"), "i") } }, // matching ANY keyword in name
                    { description: { $regex: new RegExp(filters.keywords.join("|"), "i") } }
                ];
            }

            const items = await MenuItem.find(query).populate('restaurantId', 'name').limit(20).lean();

            return NextResponse.json({
                reply: items.length > 0
                    ? `I found ${items.length} item${items.length === 1 ? '' : 's'} matching your criteria!`
                    : "I couldn't find any foods matching your exact criteria. Try adjusting your filters!",
                filters,
                items
            });

        } catch (dbError: any) {
            console.error("Chat Route DB Error:", dbError);
            return NextResponse.json({ error: "Database error occurred." }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Chat Route Main Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
