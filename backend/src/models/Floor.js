const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true },
  vehicleType: {
    type: String,
    enum: ["two_wheeler", "four_wheeler", "heavy_duty"],
    required: true,
  },
  isOccupied: { type: Boolean, default: false },
});

const floorSchema = new mongoose.Schema(
  {
    floorNumber: { type: Number, required: true, unique: true },
    floorName: { type: String, required: true },
    totalSlots: { type: Number, required: true, default: 0 },
    slots: [slotSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

floorSchema.virtual("availableSlots").get(function () {
  return this.slots.filter((s) => !s.isOccupied).length;
});

floorSchema.virtual("occupiedSlots").get(function () {
  return this.slots.filter((s) => s.isOccupied).length;
});

floorSchema.set("toObject", { virtuals: true });
floorSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Floor", floorSchema);
