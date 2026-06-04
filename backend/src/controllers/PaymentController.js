class PaymentController {
  constructor(paymentService) {
    this._service = paymentService;
  }

  getAll = async (req, res, next) => {
    try {
      const payments = await this._service.getAll(req.query);
      res.json({ success: true, data: payments });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const payment = await this._service.getById(req.params.id);
      res.json({ success: true, data: payment });
    } catch (err) { next(err); }
  };

  getByTicketId = async (req, res, next) => {
    try {
      const payment = await this._service.getByTicketId(req.params.ticketId);
      res.json({ success: true, data: payment });
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const payment = await this._service.createPayment(req.body);
      res.status(201).json({ success: true, data: payment, message: "Payment record created" });
    } catch (err) { next(err); }
  };

  confirm = async (req, res, next) => {
    try {
      const payment = await this._service.confirmPayment(req.params.id, req.body.transactionId);
      res.json({ success: true, data: payment, message: "Payment confirmed" });
    } catch (err) { next(err); }
  };

  refund = async (req, res, next) => {
    try {
      const payment = await this._service.refundPayment(req.params.id, req.body.reason);
      res.json({ success: true, data: payment, message: "Payment refunded" });
    } catch (err) { next(err); }
  };

  getRevenueStats = async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const stats = await this._service.getRevenueStats(
        startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
        endDate || new Date()
      );
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  };

  getDailyRevenue = async (req, res, next) => {
    try {
      const data = await this._service.getDailyRevenue(parseInt(req.query.days) || 7);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  getPaymentMethodBreakdown = async (req, res, next) => {
    try {
      const data = await this._service.getPaymentMethodBreakdown();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };
}

module.exports = PaymentController;
