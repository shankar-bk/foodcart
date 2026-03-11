import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();
        const order = await Order.findById(id).lean();

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Basic security: only admin, the customer, the assigned delivery agent, or the restaurant can view
        if (
            session.user.role !== 'admin' &&
            order.userId.toString() !== session.user.id &&
            order.restaurantId.toString() !== session.user.id &&
            order.deliveryAgentId?.toString() !== session.user.id
        ) {
            return NextResponse.json({ error: "Unauthorized to view this order" }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
