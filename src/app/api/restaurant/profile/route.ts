import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Restaurant } from "@/models/Restaurant";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'restaurant') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
        return NextResponse.json(restaurant);
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

        const data = await req.json();
        await dbConnect();

        const restaurant = await Restaurant.findOneAndUpdate(
            { ownerId: session.user.id },
            { $set: data },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, restaurant });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
