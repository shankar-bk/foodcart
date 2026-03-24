import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import mongoose from "mongoose";
import fs from 'fs';

function log(msg: string) {
    try {
        fs.appendFileSync('/tmp/foodcart.log', `[STATUS] ${new Date().toISOString()} - ${msg}\n`);
    } catch(e) {}
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'delivery') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        // Direct collection access to be 100% sure we see the real data
        const rawUser = await mongoose.connection.db.collection('users').findOne({ 
            _id: new mongoose.Types.ObjectId(session.user.id) 
        });

        const online = rawUser?.isOnline === true;
        log(`GET AUTHENTICATED: User ${session.user.id} isOnline: ${online}`);
        return NextResponse.json({ isOnline: online });
    } catch (err: any) {
        log(`GET ERROR: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'delivery') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { isOnline } = await req.json();
        const targetStatus = isOnline === true;
        log(`PUT REQUEST: User ${session.user.id} set to ${targetStatus}`);
        
        await dbConnect();
        
        // Use direct collection update to bypass schema caching/strictness
        const result = await mongoose.connection.db.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(session.user.id) },
            { $set: { isOnline: targetStatus } }
        );

        log(`PUT DB RESULT: matched=${result.matchedCount}, modified=${result.modifiedCount}`);

        return NextResponse.json({ 
            success: true, 
            isOnline: targetStatus 
        });
    } catch (err: any) {
        log(`PUT ERROR: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
