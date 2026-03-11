import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import Razorpay from "razorpay";

const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
}) : null;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { items, totalAmount, deliveryLocation } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        await dbConnect();

        // Assuming all items from same restaurant
        const restaurantId = items[0].restaurantId;

        // Create logic for formatting items for DB
        const dbItems = items.map((item: any) => ({
            menuItemId: item._id,
            quantity: item.quantity,
            price: item.price
        }));

        // Create Order in DB
        const order = await Order.create({
            userId: session.user.id,
            restaurantId,
            items: dbItems,
            totalAmount,
            deliveryLocation,
            paymentStatus: 'pending',
            orderStatus: 'placed'
        });

        // Generate Razorpay Order
        if (razorpay) {
            const options = {
                amount: Math.round(totalAmount * 100), // in smallest currency unit (paise/cents)
                currency: "INR",
                receipt: `receipt_order_${order._id}`
            };
            const rpOrder = await razorpay.orders.create(options);

            return NextResponse.json({
                orderId: order._id,
                rpOrderId: rpOrder.id,
                amount: options.amount
            });
        } else {
            // Dummy flow if no Razorpay keys are provided
            return NextResponse.json({
                orderId: order._id,
                rpOrderId: `dummy_rp_${order._id}`,
                amount: Math.round(totalAmount * 100)
            });
        }

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Handler for verifying payment success
export async function PUT(req: Request) {
    try {
        const { orderId, paymentId } = await req.json();
        await dbConnect();

        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            paymentId: paymentId || 'dummy_payment_id'
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
