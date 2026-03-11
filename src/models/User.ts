import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        role: {
            type: String,
            enum: ['customer', 'restaurant', 'delivery', 'admin'],
            default: 'customer'
        },
        address: { type: String },
        orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
    },
    { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
