const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    vehicleCategory: {
      type: String,
      enum: ["two_wheeler", "four_wheeler", "heavy_duty"],
      required: true,
    },
    vehicleSubClass: { type: String },
    ownerName: { type: String, trim: true },
    ownerPhone: { type: String, trim: true },
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: true,
    },
    slotId: { type: String, required: true },
    slotNumber: { type: String, required: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "exited", "cancelled"],
      default: "active",
    },
    ratePerHour: { type: Number, required: true },
  },
  { timestamps: true }
);

ticketSchema.virtual("duration").get(function () {
  if (!this.exitTime) return null;
  const ms = this.exitTime - this.entryTime;
  return Math.ceil(ms / (1000 * 60 * 60)); // hours ceiling
});

ticketSchema.set("toObject", { virtuals: true });
ticketSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Ticket", ticketSchema);
