import mongoose, { Schema, model, models } from "mongoose";

const RestaurantSchema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        location: { type: String, required: true },
        rating: { type: Number, default: 0 },
        cuisine: [{ type: String }],
        menuItems: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }]
    },
    { timestamps: true }
);

export const Restaurant = models.Restaurant || model("Restaurant", RestaurantSchema);
