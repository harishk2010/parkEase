class FloorController {
  constructor(floorService) {
    this._floorService = floorService;
  }

  getAll = async (req, res, next) => {
    try {
      const floors = await this._floorService.getAllFloors();
      res.json({ success: true, data: floors });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const floor = await this._floorService.getFloorById(req.params.id);
      res.json({ success: true, data: floor });
    } catch (err) {
      next(err);
    }
  };

  create = async (req, res, next) => {
    try {
      const floor = await this._floorService.createFloor(req.body);
      res.status(201).json({ success: true, data: floor, message: "Floor created successfully" });
    } catch (err) {
      next(err);
    }
  };

  update = async (req, res, next) => {
    try {
      const floor = await this._floorService.updateFloor(req.params.id, req.body);
      res.json({ success: true, data: floor, message: "Floor updated successfully" });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this._floorService.deleteFloor(req.params.id);
      res.json({ success: true, message: "Floor deactivated successfully" });
    } catch (err) {
      next(err);
    }
  };

  getOccupancySummary = async (req, res, next) => {
    try {
      const summary = await this._floorService.getOccupancySummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = FloorController;
