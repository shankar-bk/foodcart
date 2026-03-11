import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Aggregations
        const orders = await Order.find({}).lean();
        const totalOrders = orders.length;
        const revenue = orders.reduce((acc, order) => {
            // If payment is paid or order is delivered, count as revenue
            return acc + (order.totalAmount || 0);
        }, 0);

        const users = await User.find({}).select("-password").lean();
        const customerCount = users.filter(u => u.role === 'customer').length;
        const restaurantCount = users.filter(u => u.role === 'restaurant').length;

        const stats = {
            totalOrders,
            revenue,
            customerCount,
            restaurantCount
        };

        return NextResponse.json({ stats, users });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, role } = await req.json();
        await dbConnect();

        // Check against changing your own role accidentally
        if (session.user.id === userId) {
            return NextResponse.json({ error: "Cannot change own role" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
