const GenericRepository = require("./GenericRepository");
const Ticket = require("../models/Ticket");

class TicketRepository extends GenericRepository {
  constructor() {
    super(Ticket);
  }

  async findByTicketNumber(ticketNumber) {
    return this._model.findOne({ ticketNumber }).populate("floorId").lean();
  }

  async findByVehicleNumber(vehicleNumber) {
    return this._model
      .find({ vehicleNumber: vehicleNumber.toUpperCase() })
      .populate("floorId")
      .sort({ createdAt: -1 })
      .lean();
  }

  async findActiveTicket(vehicleNumber) {
    return this._model
      .findOne({ vehicleNumber: vehicleNumber.toUpperCase(), status: "active" })
      .populate("floorId")
      .lean();
  }

  async findActiveTickets() {
    return this._model
      .find({ status: "active" })
      .populate("floorId")
      .sort({ entryTime: -1 })
      .lean();
  }

  async getDailyStats(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this._model.aggregate([
      { $match: { entryTime: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$vehicleCategory",
          count: { $sum: 1 },
          exited: {
            $sum: { $cond: [{ $eq: ["$status", "exited"] }, 1, 0] },
          },
        },
      },
    ]);
  }
}

module.exports = TicketRepository;
