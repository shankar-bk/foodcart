import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";
import { Restaurant } from "@/models/Restaurant";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'restaurant') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, price, description, veg, image } = await req.json();
        await dbConnect();

        // Security check: verify the item belongs to a restaurant owned by this user
        const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
        if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

        const updatedItem = await MenuItem.findOneAndUpdate(
            { _id: id, restaurantId: restaurant._id },
            { name, price, description, veg, image },
            { new: true, returnDocument: 'after' }
        );

        if (!updatedItem) return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });

        return NextResponse.json(updatedItem);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'restaurant') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Security check: verify the item belongs to a restaurant owned by this user
        const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
        if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

        const deletedItem = await MenuItem.findOneAndDelete({ _id: id, restaurantId: restaurant._id });

        if (!deletedItem) return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });

        return NextResponse.json({ message: "Item deleted successfully" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
