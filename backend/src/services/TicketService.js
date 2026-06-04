const { v4: uuidv4 } = require("uuid");

class TicketService {
  constructor(ticketRepository, floorService, vehicleTypeService) {
    this._ticketRepo = ticketRepository;
    this._floorService = floorService;
    this._vehicleTypeService = vehicleTypeService;
  }

  _generateTicketNumber() {
    const now = new Date();
    const prefix = `TKT${now.getFullYear()}${String(now.getMonth() + 1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
    return `${prefix}-${uuidv4().split("-")[0].toUpperCase()}`;
  }

  async getAll(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.vehicleCategory) filter.vehicleCategory = query.vehicleCategory;
    return this._ticketRepo.findAll(filter, { populate: "floorId" });
  }

  async getById(id) {
    const ticket = await this._ticketRepo.findById(id, "floorId");
    if (!ticket) throw { status: 404, message: "Ticket not found" };
    return ticket;
  }

  async getByTicketNumber(ticketNumber) {
    const ticket = await this._ticketRepo.findByTicketNumber(ticketNumber);
    if (!ticket) throw { status: 404, message: "Ticket not found" };
    return ticket;
  }

  async getActiveTickets() {
    return this._ticketRepo.findActiveTickets();
  }

  async createTicket(data) {
    const { vehicleNumber, vehicleCategory, vehicleSubClass, floorId, ownerName, ownerPhone } = data;

    const active = await this._ticketRepo.findActiveTicket(vehicleNumber);
    if (active) throw { status: 409, message: `Vehicle ${vehicleNumber} already has an active ticket` };

    const vehicleType = await this._vehicleTypeService.getByCategory(vehicleCategory);
    let ratePerHour = vehicleType.baseRatePerHour;

    if (vehicleSubClass) {
      const sub = vehicleType.subClasses.find((s) => s.name === vehicleSubClass);
      if (sub) ratePerHour = sub.ratePerHour;
    }

    const slot = await this._floorService.findAvailableSlot(floorId, vehicleCategory);
    if (!slot) throw { status: 409, message: "No available slots for this vehicle type on selected floor" };

    await this._floorService.updateSlotOccupancy(floorId, slot._id, true);

    return this._ticketRepo.create({
      ticketNumber: this._generateTicketNumber(),
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleCategory,
      vehicleSubClass,
      ownerName,
      ownerPhone,
      floorId,
      slotId: slot._id,
      slotNumber: slot.slotNumber,
      entryTime: new Date(),
      ratePerHour,
    });
  }

  async processExit(ticketNumber) {
    const ticket = await this._ticketRepo.findByTicketNumber(ticketNumber);
    if (!ticket) throw { status: 404, message: "Ticket not found" };
    if (ticket.status !== "active") throw { status: 400, message: "Ticket is not active" };

    const exitTime = new Date();
    const updated = await this._ticketRepo.update(ticket._id, { exitTime, status: "exited" });

    await this._floorService.updateSlotOccupancy(ticket.floorId._id || ticket.floorId, ticket.slotId, false);

    const durationMs = exitTime - new Date(ticket.entryTime);
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const amount = durationHours * ticket.ratePerHour;

    return { ticket: updated, durationHours, amount, ratePerHour: ticket.ratePerHour };
  }

  async cancelTicket(id) {
    const ticket = await this._ticketRepo.findById(id);
    if (!ticket) throw { status: 404, message: "Ticket not found" };
    if (ticket.status !== "active") throw { status: 400, message: "Only active tickets can be cancelled" };

    await this._floorService.updateSlotOccupancy(ticket.floorId, ticket.slotId, false);
    return this._ticketRepo.update(id, { status: "cancelled" });
  }

  async getDailyStats(date) {
    return this._ticketRepo.getDailyStats(date || new Date());
  }
}

module.exports = TicketService;
