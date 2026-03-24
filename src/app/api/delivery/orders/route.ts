import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/models/Order";
import { Restaurant } from "@/models/Restaurant";
import mongoose from "mongoose";
import fs from 'fs';

function log(msg: string) {
    try {
        fs.appendFileSync('/tmp/foodcart.log', `[ORDERS] ${new Date().toISOString()} - ${msg}\n`);
    } catch(e) {}
}

function getDeterministicPin(id: string, type: 'res' | 'cust') {
    const seed = id.toString() + (type === 'res' ? 'RESTAURANT' : 'CUSTOMER');
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    return (Math.abs(hash) % 9000 + 1000).toString();
}

function getDeterministicEarnings(id: any) {
    const idStr = id.toString();
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = (hash << 5) - hash + idStr.charCodeAt(i);
        hash |= 0;
    }
    return (Math.abs(hash) % 21 + 40); // ₹40 - ₹60
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'delivery') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Direct collection fetch
        const rawUser = await mongoose.connection.db.collection('users').findOne({ 
            _id: new mongoose.Types.ObjectId(session.user.id) 
        });
        const isOnline = rawUser?.isOnline === true;
        
        log(`GET ORDERS: User ${session.user.id} online status: ${isOnline}`);

        // Ensure relations are loaded
        Restaurant.init();

        let available = [];
        if (isOnline) {
            const rawAvailable = await Order.find({
                orderStatus: 'ready',
                deliveryAgentId: { $exists: false }
            }).populate('restaurantId', 'name location').lean();

            available = rawAvailable.map(o => ({
                ...o,
                deliveryEarnings: o.deliveryEarnings || getDeterministicEarnings(o._id),
                restaurantPin: o.restaurantPin || getDeterministicPin(o._id, 'res'),
                customerPin: o.customerPin || getDeterministicPin(o._id, 'cust')
            }));
        }

        const rawMyDeliveries = await Order.find({
            deliveryAgentId: session.user.id,
            orderStatus: { $in: ['ready', 'out_for_delivery'] }
        }).populate('restaurantId', 'name location').lean();

        const myDeliveries = rawMyDeliveries.map(o => ({
            ...o,
            deliveryEarnings: o.deliveryEarnings || getDeterministicEarnings(o._id),
            restaurantPin: o.restaurantPin || getDeterministicPin(o._id, 'res'),
            customerPin: o.customerPin || getDeterministicPin(o._id, 'cust')
        }));

        const completedDeliveries = await Order.find({
            deliveryAgentId: session.user.id,
            orderStatus: 'delivered'
        });

        const totalEarnings = completedDeliveries.reduce((acc, curr) => acc + (curr.deliveryEarnings || getDeterministicEarnings(curr._id.toString())), 0);

        return NextResponse.json({ 
            available, 
            myDeliveries, 
            isOnline, 
            totalEarnings, 
            completedCount: completedDeliveries.length 
        });
    } catch (err: any) {
        log(`GET ORDERS ERROR: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'delivery') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const rawUser = await mongoose.connection.db.collection('users').findOne({ 
            _id: new mongoose.Types.ObjectId(session.user.id) 
        });
        const isOnline = rawUser?.isOnline === true;

        if (!isOnline) {
            log(`PUT REJECTED: Rider is offline`);
            return NextResponse.json({ error: "You must be online to manage orders" }, { status: 400 });
        }

        const { orderId, action, status, pin } = await req.json();
        
        let order;

        if (action === 'accept') {
            const existing = await Order.findById(orderId);
            if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 });
            if (existing.deliveryAgentId) {
                return NextResponse.json({ error: "Order already accepted" }, { status: 400 });
            }

            const updates: any = { deliveryAgentId: session.user.id };
            if (!existing.deliveryEarnings) updates.deliveryEarnings = getDeterministicEarnings(orderId);
            if (!existing.restaurantPin) updates.restaurantPin = getDeterministicPin(orderId, 'res');
            if (!existing.customerPin) updates.customerPin = getDeterministicPin(orderId, 'cust');

            order = await Order.findByIdAndUpdate(orderId, updates, { new: true, returnDocument: 'after' });
        } else if (action === 'status') {
            const targetOrder = await Order.findById(orderId);
            
            const expectedResPin = targetOrder.restaurantPin || getDeterministicPin(orderId, 'res');
            const expectedCustPin = targetOrder.customerPin || getDeterministicPin(orderId, 'cust');

            if (status === 'out_for_delivery') {
                log(`PIN VERIFY: Received[${pin}] Expected[${expectedResPin}] Match: ${String(pin) === String(expectedResPin)}`);
                if (String(pin) !== String(expectedResPin)) {
                    return NextResponse.json({ error: "Invalid Restaurant PIN" }, { status: 400 });
                }
            } else if (status === 'delivered') {
                log(`PIN VERIFY: Received[${pin}] Expected[${expectedCustPin}] Match: ${String(pin) === String(expectedCustPin)}`);
                if (String(pin) !== String(expectedCustPin)) {
                    return NextResponse.json({ error: "Invalid Customer PIN" }, { status: 400 });
                }
            }

            order = await Order.findByIdAndUpdate(orderId, {
                orderStatus: status
            }, { new: true });
        }

        return NextResponse.json(order);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
