import { NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";
import { Restaurant } from "@/models/Restaurant";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const systemPrompt = `You are an AI Food Ordering Assistant. Your task is to extract food search filters from the user's input.
        
        CRITICAL RULES:
        1. IF the user's input is NOT about food, restaurants, or ordering, return EXACTLY: {"error": "Please ask questions related to food orders only."}
        2. ONLY extract filters that are EXPLICITLY mentioned or strongly implied by the user's request.
        3. DO NOT use default values from examples if the user didn't specify them.
        4. OMIT fields from the JSON if they are not specified.
        
        FILTER SPECIFICS:
        - "veg": boolean (CRITICAL: true if user says "veg", "vegetarian", "vegan". false if user says "non-veg", "meat", "chicken", "mutton". OMIT if not specified)
        - "maxPrice": number (the price limit mentioned. OMIT if not specified)
         - "rating": number (the minimum rating. ONLY extract if user says "best", "top", "highly rated", or specifies "4+ star" etc. DO NOT assume a rating if not mentioned.)
         - "keywords": array of strings (specific food names like "biriyani", "pizza", "burger". DO NOT include "veg" or "non-veg" here)
            
         Example 1:
         User: "veg biriyani"
         Output: {"veg": true, "keywords": ["biriyani"]}
         
         Example 2:
         User: "non-veg pizza"
         Output: {"veg": false, "keywords": ["pizza"]}

         Example 3:
         User: "burger"
         Output: {"keywords": ["burger"]} (Notice: NO rating filter assumed)
         
         Return ONLY a clean JSON object. No markdown, no extra text.`;

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
                // Backend Safety: If AI failed to extract 'veg' but put it in keywords
                const kws = filters.keywords.map((k: string) => k.toLowerCase());
                if (kws.includes("veg") || kws.includes("vegetarian")) {
                    query.veg = true;
                } else if (kws.includes("non-veg") || kws.includes("nonveg")) {
                    query.veg = false;
                }

                // Clean keywords for query
                const cleanKeywords = filters.keywords.filter((k: string) => 
                    !["veg", "non-veg", "vegetarian", "nonveg"].includes(k.toLowerCase())
                );

                if (cleanKeywords.length > 0) {
                    query.$or = [
                        { name: { $regex: new RegExp(cleanKeywords.join("|"), "i") } },
                        { description: { $regex: new RegExp(cleanKeywords.join("|"), "i") } }
                    ];
                }
            }

            let items = await MenuItem.find(query).populate('restaurantId', 'name').limit(20).lean();

            // Fallback 1: If no results, try relaxing strict filters (rating, price)
            if (items.length === 0 && (query.rating || query.price)) {
                const relaxedQuery = { ...query };
                delete relaxedQuery.rating;
                delete relaxedQuery.price;
                items = await MenuItem.find(relaxedQuery).populate('restaurantId', 'name').limit(20).lean();
            }

            // Fallback 2: If still no results, try searching with just keywords
            if (items.length === 0 && query.$or) {
                items = await MenuItem.find({ $or: query.$or }).populate('restaurantId', 'name').limit(20).lean();
            }

            let reply = items.length > 0
                ? `I found ${items.length} item${items.length === 1 ? '' : 's'} matching your criteria!`
                : "I couldn't find any foods matching your exact criteria. Try adjusting your filters!";

            // Final Fallback: If absolutely nothing matches keywords, return all items as suggestions
            if (items.length === 0) {
                items = await MenuItem.find({}).populate('restaurantId', 'name').limit(10).lean();
                reply = "I couldn't find exactly that, but here are some of our most popular dishes you might enjoy!";
            }

            return NextResponse.json({
                reply,
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
