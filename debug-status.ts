import mongoose from 'mongoose';
import { User } from './src/models/User.ts';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("Connected to MongoDB");

        const users = await User.find({ role: 'delivery' });
        console.log("Delivery Users count:", users.length);
        
        users.forEach(u => {
            console.log(`User: ${u.email}, ID: ${u._id}, isOnline: ${u.isOnline}`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debug();
