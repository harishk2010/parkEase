class VehicleTypeService {
  constructor(vehicleTypeRepository) {
    this._repo = vehicleTypeRepository;
  }

  async getAll() {
    return this._repo.findActiveTypes();
  }

  async getById(id) {
    const vt = await this._repo.findById(id);
    if (!vt) throw { status: 404, message: "Vehicle type not found" };
    return vt;
  }

  async getByCategory(category) {
    const vt = await this._repo.findByCategory(category);
    if (!vt) throw { status: 404, message: "Vehicle type not found" };
    return vt;
  }

  async create(data) {
    const existing = await this._repo.findByCategory(data.category);
    if (existing) throw { status: 409, message: `Vehicle type '${data.category}' already exists` };
    return this._repo.create(data);
  }

  async update(id, data) {
    const vt = await this._repo.findById(id);
    if (!vt) throw { status: 404, message: "Vehicle type not found" };
    return this._repo.update(id, data);
  }

  async addSubClass(id, subClassData) {
    const vt = await this._repo.findById(id);
    if (!vt) throw { status: 404, message: "Vehicle type not found" };
    const updated = await this._repo._model
      .findByIdAndUpdate(id, { $push: { subClasses: subClassData } }, { new: true })
      .lean();
    return updated;
  }

  async removeSubClass(id, subClassId) {
    const vt = await this._repo.findById(id);
    if (!vt) throw { status: 404, message: "Vehicle type not found" };
    const updated = await this._repo._model
      .findByIdAndUpdate(id, { $pull: { subClasses: { _id: subClassId } } }, { new: true })
      .lean();
    return updated;
  }

  async delete(id) {
    const vt = await this._repo.findById(id);
    if (!vt) throw { status: 404, message: "Vehicle type not found" };
    return this._repo.update(id, { isActive: false });
  }
}

module.exports = VehicleTypeService;
