import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { Restaurant } from "@/models/Restaurant";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'delivery') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Ensure relations are loaded
        Restaurant.init();

        // Available orders are those 'ready' but no delivery agent assigned
        const available = await Order.find({
            orderStatus: 'ready',
            deliveryAgentId: { $exists: false }
        }).populate('restaurantId', 'name location').lean();

        // Deliveries assigned to this agent where status is not delivered or cancelled
        const myDeliveries = await Order.find({
            deliveryAgentId: session.user.id,
            orderStatus: { $in: ['ready', 'out_for_delivery'] }
        }).populate('restaurantId', 'name location').lean();

        return NextResponse.json({ available, myDeliveries });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'delivery') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, action, status } = await req.json();
        await dbConnect();

        let order;
        if (action === 'accept') {
            order = await Order.findByIdAndUpdate(orderId, {
                deliveryAgentId: session.user.id
            }, { new: true });
        } else if (action === 'status') {
            order = await Order.findByIdAndUpdate(orderId, {
                orderStatus: status
            }, { new: true });
        }

        // Call Pusher trigger here for real-time update to customer

        return NextResponse.json(order);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
