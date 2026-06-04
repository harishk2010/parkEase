const mongoose = require("mongoose");

const subClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  ratePerHour: { type: Number, required: true },
  ratePerDay: { type: Number },
});

const vehicleTypeSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["two_wheeler", "four_wheeler", "heavy_duty"],
      required: true,
      unique: true,
    },
    displayName: { type: String, required: true },
    description: { type: String },
    baseRatePerHour: { type: Number, required: true },
    baseRatePerDay: { type: Number },
    subClasses: [subClassSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VehicleType", vehicleTypeSchema);
