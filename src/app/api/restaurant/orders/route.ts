import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { Restaurant } from "@/models/Restaurant";
import { MenuItem } from "@/models/MenuItem"; // Ensure models are registered

function getDeterministicPin(id: string, type: 'res' | 'cust') {
    const seed = id.toString() + (type === 'res' ? 'RESTAURANT' : 'CUSTOMER');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    return (Math.abs(hash) % 9000 + 1000).toString();
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'restaurant') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
        if (!restaurant) return NextResponse.json([], { status: 200 });

        MenuItem.init();
        const orders = await Order.find({ restaurantId: restaurant._id })
            .populate({
                path: 'items.menuItemId',
                model: 'MenuItem',
                select: 'name price'
            })
            .sort({ createdAt: -1 });

        // Ensure PINs are always present via deterministic fallback
        const ordersWithPins = orders.map((order: any) => {
            const o = order.toObject();
            if (!o.restaurantPin) o.restaurantPin = getDeterministicPin(o._id, 'res');
            if (!o.customerPin) o.customerPin = getDeterministicPin(o._id, 'cust');
            return o;
        });

        return NextResponse.json(ordersWithPins);
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

        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        const updates: any = { orderStatus: status };
        
        // If PIN is missing, we use the deterministic one to save it permanently
        if (!order.restaurantPin) updates.restaurantPin = getDeterministicPin(orderId, 'res');
        if (!order.customerPin) updates.customerPin = getDeterministicPin(orderId, 'cust');

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, { new: true, returnDocument: 'after' });

        return NextResponse.json(updatedOrder);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
