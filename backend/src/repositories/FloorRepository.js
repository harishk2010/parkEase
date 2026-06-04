const GenericRepository = require("./GenericRepository");
const Floor = require("../models/Floor");

class FloorRepository extends GenericRepository {
  constructor() {
    super(Floor);
  }

  async findByFloorNumber(floorNumber) {
    return this._model.findOne({ floorNumber }).lean();
  }

  async updateSlotOccupancy(floorId, slotId, isOccupied) {
    return this._model
      .findOneAndUpdate(
        { _id: floorId, "slots._id": slotId },
        { $set: { "slots.$.isOccupied": isOccupied } },
        { new: true }
      )
      .lean();
  }

  async findAvailableSlot(floorId, vehicleType) {
    const floor = await this._model
      .findOne({
        _id: floorId,
        slots: { $elemMatch: { vehicleType, isOccupied: false } },
      })
      .lean();
    if (!floor) return null;
    return floor.slots.find((s) => s.vehicleType === vehicleType && !s.isOccupied);
  }

  async getOccupancySummary() {
    return this._model.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          floorNumber: 1,
          floorName: 1,
          totalSlots: { $size: "$slots" },
          occupiedSlots: {
            $size: { $filter: { input: "$slots", as: "s", cond: "$$s.isOccupied" } },
          },
        },
      },
      {
        $addFields: {
          availableSlots: { $subtract: ["$totalSlots", "$occupiedSlots"] },
        },
      },
      { $sort: { floorNumber: 1 } },
    ]);
  }
}

module.exports = FloorRepository;
