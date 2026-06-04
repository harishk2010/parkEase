const GenericRepository = require("./GenericRepository");
const Payment = require("../models/Payment");

class PaymentRepository extends GenericRepository {
  constructor() {
    super(Payment);
  }

  async findByTicketId(ticketId) {
    return this._model.findOne({ ticketId }).populate("ticketId").lean();
  }

  async getRevenueStats(startDate, endDate) {
    return this._model.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          paidAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalTransactions: { $sum: 1 },
          avgAmount: { $avg: "$totalAmount" },
        },
      },
    ]);
  }

  async getDailyRevenue(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this._model.aggregate([
      { $match: { paymentStatus: "paid", paidAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getPaymentMethodBreakdown() {
    return this._model.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

module.exports = PaymentRepository;
