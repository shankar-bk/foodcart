import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();
        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'customer';

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole
        });

        return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Error writing to database", error: error.message }, { status: 500 });
    }
}
