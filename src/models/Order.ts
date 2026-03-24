import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        deliveryAgentId: { type: Schema.Types.ObjectId, ref: 'DeliveryAgent' },
        items: [
            {
                menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true }
            }
        ],
        totalAmount: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        paymentId: { type: String }, // Razorpay/Stripe details
        orderStatus: {
            type: String,
            enum: ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
            default: 'placed'
        },
        deliveryLocation: { type: String, required: true },
        restaurantPin: { type: String },
        customerPin: { type: String },
        deliveryEarnings: { type: Number }
    },
    { timestamps: true }
);

export const Order = models.Order || model("Order", OrderSchema);
