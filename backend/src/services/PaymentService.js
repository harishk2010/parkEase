class PaymentService {
  constructor(paymentRepository, ticketRepository) {
    this._paymentRepo = paymentRepository;
    this._ticketRepo = ticketRepository;
  }

  async getAll(query = {}) {
    const filter = {};
    if (query.status) filter.paymentStatus = query.status;
    return this._paymentRepo.findAll(filter);
  }

  async getById(id) {
    const payment = await this._paymentRepo.findById(id);
    if (!payment) throw { status: 404, message: "Payment not found" };
    return payment;
  }

  async getByTicketId(ticketId) {
    const payment = await this._paymentRepo.findByTicketId(ticketId);
    if (!payment) throw { status: 404, message: "Payment not found for this ticket" };
    return payment;
  }

  async createPayment(data) {
    const { ticketId, paymentMethod, discount = 0, tax = 0, notes } = data;

    const ticket = await this._ticketRepo.findById(ticketId, "floorId");
    if (!ticket) throw { status: 404, message: "Ticket not found" };
    if (ticket.status !== "exited") throw { status: 400, message: "Ticket must be exited before payment" };

    const existingPayment = await this._paymentRepo.findByTicketId(ticketId);
    if (existingPayment && existingPayment.paymentStatus === "paid") {
      throw { status: 409, message: "Payment already processed for this ticket" };
    }

    const durationMs = new Date(ticket.exitTime) - new Date(ticket.entryTime);
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const baseAmount = durationHours * ticket.ratePerHour;
    const totalAmount = baseAmount - discount + tax;

    return this._paymentRepo.create({
      ticketId,
      ticketNumber: ticket.ticketNumber,
      vehicleNumber: ticket.vehicleNumber,
      entryTime: ticket.entryTime,
      exitTime: ticket.exitTime,
      durationHours,
      ratePerHour: ticket.ratePerHour,
      baseAmount,
      discount,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus: "pending",
      notes,
    });
  }

  async confirmPayment(id, transactionId) {
    const payment = await this._paymentRepo.findById(id);
    if (!payment) throw { status: 404, message: "Payment not found" };
    if (payment.paymentStatus === "paid") throw { status: 400, message: "Payment already confirmed" };

    return this._paymentRepo.update(id, {
      paymentStatus: "paid",
      transactionId: transactionId || null,
      paidAt: new Date(),
    });
  }

  async refundPayment(id, reason) {
    const payment = await this._paymentRepo.findById(id);
    if (!payment) throw { status: 404, message: "Payment not found" };
    if (payment.paymentStatus !== "paid") throw { status: 400, message: "Only paid payments can be refunded" };

    return this._paymentRepo.update(id, {
      paymentStatus: "refunded",
      notes: reason || "Refunded",
    });
  }

  async getRevenueStats(startDate, endDate) {
    return this._paymentRepo.getRevenueStats(startDate, endDate);
  }

  async getDailyRevenue(days) {
    return this._paymentRepo.getDailyRevenue(days);
  }

  async getPaymentMethodBreakdown() {
    return this._paymentRepo.getPaymentMethodBreakdown();
  }
}

module.exports = PaymentService;
