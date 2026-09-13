const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        productId: {
            type: Schema.Types.Mixed,
            required: true,
        },
        productName: {
            type: String,
            required: true,
        },
        sellerId: {
            type: Schema.Types.Mixed,
            required: true,
            index: true,
        },
        buyerName: {
            type: String,
            required: true,
        },
        buyerPhone: {
            type: String,
            default: "N/A",
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        deliveryAddress: {
            city: { type: String, required: true },
            state: { type: String, required: true },
            pinCode: { type: String, required: true },
        },
        status: {
            type: String,
            default: "Confirmed",
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
