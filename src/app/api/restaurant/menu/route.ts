import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";
import { Restaurant } from "@/models/Restaurant";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'restaurant') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
        if (!restaurant) return NextResponse.json([], { status: 200 });

        const menu = await MenuItem.find({ restaurantId: restaurant._id });
        return NextResponse.json(menu);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'restaurant') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, price, description, veg } = await req.json();
        await dbConnect();

        // Check if restaurant exists for this user, if not create one
        let restaurant = await Restaurant.findOne({ ownerId: session.user.id });
        if (!restaurant) {
            restaurant = await Restaurant.create({
                ownerId: session.user.id,
                name: `${session.user.name}'s Restaurant`,
                location: "Virtual Location",
                cuisine: ["Multi-cuisine"]
            });
        }

        const newItem = await MenuItem.create({
            restaurantId: restaurant._id,
            name,
            price,
            description,
            veg
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
