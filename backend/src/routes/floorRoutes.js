const express = require("express");
const FloorController = require("../controllers/FloorController");
const FloorService = require("../services/FloorService");
const FloorRepository = require("../repositories/FloorRepository");

const router = express.Router();

// Dependency injection chain
const floorRepository = new FloorRepository();
const floorService = new FloorService(floorRepository);
const floorController = new FloorController(floorService);

router.get("/", floorController.getAll);
router.get("/occupancy-summary", floorController.getOccupancySummary);
router.get("/:id", floorController.getById);
router.post("/", floorController.create);
router.put("/:id", floorController.update);
router.delete("/:id", floorController.delete);

module.exports = router;
