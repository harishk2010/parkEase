class VehicleTypeController {
  constructor(vehicleTypeService) {
    this._service = vehicleTypeService;
  }

  getAll = async (req, res, next) => {
    try {
      const types = await this._service.getAll();
      res.json({ success: true, data: types });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const type = await this._service.getById(req.params.id);
      res.json({ success: true, data: type });
    } catch (err) { next(err); }
  };

  create = async (req, res, next) => {
    try {
      const type = await this._service.create(req.body);
      res.status(201).json({ success: true, data: type, message: "Vehicle type created" });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const type = await this._service.update(req.params.id, req.body);
      res.json({ success: true, data: type, message: "Vehicle type updated" });
    } catch (err) { next(err); }
  };

  addSubClass = async (req, res, next) => {
    try {
      const type = await this._service.addSubClass(req.params.id, req.body);
      res.json({ success: true, data: type, message: "Sub-class added" });
    } catch (err) { next(err); }
  };

  removeSubClass = async (req, res, next) => {
    try {
      const type = await this._service.removeSubClass(req.params.id, req.params.subClassId);
      res.json({ success: true, data: type, message: "Sub-class removed" });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this._service.delete(req.params.id);
      res.json({ success: true, message: "Vehicle type deactivated" });
    } catch (err) { next(err); }
  };
}

module.exports = VehicleTypeController;
