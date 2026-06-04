const express = require("express");
const TicketController = require("../controllers/TicketController");
const TicketService = require("../services/TicketService");
const TicketRepository = require("../repositories/TicketRepository");
const FloorService = require("../services/FloorService");
const FloorRepository = require("../repositories/FloorRepository");
const VehicleTypeService = require("../services/VehicleTypeService");
const VehicleTypeRepository = require("../repositories/VehicleTypeRepository");

const router = express.Router();

const ticketRepository = new TicketRepository();
const floorRepository = new FloorRepository();
const vehicleTypeRepository = new VehicleTypeRepository();
const floorService = new FloorService(floorRepository);
const vehicleTypeService = new VehicleTypeService(vehicleTypeRepository);
const ticketService = new TicketService(ticketRepository, floorService, vehicleTypeService);
const ticketController = new TicketController(ticketService);

router.get("/", ticketController.getAll);
router.get("/active", ticketController.getActiveTickets);
router.get("/stats/daily", ticketController.getDailyStats);
router.get("/number/:ticketNumber", ticketController.getByTicketNumber);
router.get("/:id", ticketController.getById);
router.post("/", ticketController.create);
router.patch("/exit/:ticketNumber", ticketController.processExit);
router.patch("/:id/cancel", ticketController.cancel);

module.exports = router;
