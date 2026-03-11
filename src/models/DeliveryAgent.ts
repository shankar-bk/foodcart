import mongoose, { Schema, model, models } from "mongoose";

const DeliveryAgentSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        vehicle: { type: String },
        availability: { type: Boolean, default: true },
        currentLocation: {
            lat: { type: Number },
            lng: { type: Number },
            address: { type: String }
        }
    },
    { timestamps: true }
);

export const DeliveryAgent = models.DeliveryAgent || model("DeliveryAgent", DeliveryAgentSchema);
