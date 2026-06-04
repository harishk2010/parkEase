const GenericRepository = require("./GenericRepository");
const VehicleType = require("../models/VehicleType");

class VehicleTypeRepository extends GenericRepository {
  constructor() {
    super(VehicleType);
  }

  async findByCategory(category) {
    return this._model.findOne({ category }).lean();
  }

  async findActiveTypes() {
    return this._model.find({ isActive: true }).lean();
  }
}

module.exports = VehicleTypeRepository;
