const express = require("express");
const PaymentController = require("../controllers/PaymentController");
const PaymentService = require("../services/PaymentService");
const PaymentRepository = require("../repositories/PaymentRepository");
const TicketRepository = require("../repositories/TicketRepository");

const router = express.Router();

const paymentRepository = new PaymentRepository();
const ticketRepository = new TicketRepository();
const paymentService = new PaymentService(paymentRepository, ticketRepository);
const paymentController = new PaymentController(paymentService);

router.get("/", paymentController.getAll);
router.get("/stats/revenue", paymentController.getRevenueStats);
router.get("/stats/daily", paymentController.getDailyRevenue);
router.get("/stats/methods", paymentController.getPaymentMethodBreakdown);
router.get("/ticket/:ticketId", paymentController.getByTicketId);
router.get("/:id", paymentController.getById);
router.post("/", paymentController.create);
router.patch("/:id/confirm", paymentController.confirm);
router.patch("/:id/refund", paymentController.refund);

module.exports = router;
