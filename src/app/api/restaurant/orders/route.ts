import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { Restaurant } from "@/models/Restaurant";
import { MenuItem } from "@/models/MenuItem"; // Ensure models are registered

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'restaurant') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
        if (!restaurant) return NextResponse.json([], { status: 200 });

        // Using explicit populate names for items
        MenuItem.init();
        const orders = await Order.find({ restaurantId: restaurant._id })
            .populate({
                path: 'items.menuItemId',
                model: 'MenuItem',
                select: 'name price'
            })
            .sort({ createdAt: -1 });

        return NextResponse.json(orders);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'restaurant') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, status } = await req.json();
        await dbConnect();

        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });

        // In a real app, trigger Pusher event here to notify customer/delivery agent of order status change
        // pusherServer.trigger(`order-${orderId}`, 'status-update', { status: order.orderStatus });

        return NextResponse.json(order);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
