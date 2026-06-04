const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      unique: true,
    },
    ticketNumber: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, required: true },
    durationHours: { type: Number, required: true },
    ratePerHour: { type: Number, required: true },
    baseAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, default: null },
    paidAt: { type: Date, default: null },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
