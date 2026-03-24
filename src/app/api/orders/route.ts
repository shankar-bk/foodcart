import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Fetch orders for the logged-in user, populated with restaurant names
        const orders = await Order.find({ userId: session.user.id })
            .populate('restaurantId', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json(orders);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
