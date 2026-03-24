const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected");
    
    // Check all users
    const users = await mongoose.connection.db.collection('users').find({ role: 'delivery' }).toArray();
    console.log("Riders:", JSON.stringify(users, null, 2));
    
    process.exit(0);
}

run();
