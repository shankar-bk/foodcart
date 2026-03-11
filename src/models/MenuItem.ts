import mongoose, { Schema, model, models } from "mongoose";

const MenuItemSchema = new Schema(
    {
        restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        veg: { type: Boolean, required: true, default: true },
        rating: { type: Number, default: 0 },
        preparationTime: { type: Number, default: 15 }, // in minutes
        image: { type: String } // optional image URL
    },
    { timestamps: true }
);

export const MenuItem = models.MenuItem || model("MenuItem", MenuItemSchema);
