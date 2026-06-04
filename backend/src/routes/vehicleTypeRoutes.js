const express = require("express");
const VehicleTypeController = require("../controllers/VehicleTypeController");
const VehicleTypeService = require("../services/VehicleTypeService");
const VehicleTypeRepository = require("../repositories/VehicleTypeRepository");

const router = express.Router();

const vehicleTypeRepository = new VehicleTypeRepository();
const vehicleTypeService = new VehicleTypeService(vehicleTypeRepository);
const vehicleTypeController = new VehicleTypeController(vehicleTypeService);

router.get("/", vehicleTypeController.getAll);
router.get("/:id", vehicleTypeController.getById);
router.post("/", vehicleTypeController.create);
router.put("/:id", vehicleTypeController.update);
router.post("/:id/subclasses", vehicleTypeController.addSubClass);
router.delete("/:id/subclasses/:subClassId", vehicleTypeController.removeSubClass);
router.delete("/:id", vehicleTypeController.delete);

module.exports = router;
