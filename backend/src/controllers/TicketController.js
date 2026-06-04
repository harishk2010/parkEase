class TicketController {
  constructor(ticketService) {
    this._service = ticketService;
  }

  getAll = async (req, res, next) => {
    try {
      const tickets = await this._service.getAll(req.query);
      res.json({ success: true, data: tickets });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const ticket = await this._service.getById(req.params.id);
      res.json({ success: true, data: ticket });
    } catch (err) { next(err); }
  };

  getByTicketNumber = async (req, res, next) => {
    try {
      const ticket = await this._service.getByTicketNumber(req.params.ticketNumber);
      res.json({ success: true, data: ticket });
    } catch (err) { next(err); }
  };

  getActiveTickets = async (req, res, next) => {
    try {
      const tickets = await this._service.getActiveTickets();
      res.json({ success: true, data: tickets });
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const ticket = await this._service.createTicket(req.body);
      res.status(201).json({ success: true, data: ticket, message: "Ticket created successfully" });
    } catch (err) { next(err); }
  };

  processExit = async (req, res, next) => {
    try {
      const result = await this._service.processExit(req.params.ticketNumber);
      res.json({ success: true, data: result, message: "Exit processed. Proceed to payment." });
    } catch (err) { next(err); }
  };

  cancel = async (req, res, next) => {
    try {
      const ticket = await this._service.cancelTicket(req.params.id);
      res.json({ success: true, data: ticket, message: "Ticket cancelled" });
    } catch (err) { next(err); }
  };

  getDailyStats = async (req, res, next) => {
    try {
      const stats = await this._service.getDailyStats(req.query.date);
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  };
}

module.exports = TicketController;
