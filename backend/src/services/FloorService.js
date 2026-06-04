class FloorService {
  constructor(floorRepository) {
    this._floorRepo = floorRepository;
  }

  async getAllFloors() {
    return this._floorRepo.findAll({ isActive: true }, { sort: { floorNumber: 1 } });
  }

  async getFloorById(id) {
    const floor = await this._floorRepo.findById(id);
    if (!floor) throw { status: 404, message: "Floor not found" };
    return floor;
  }

  async createFloor(data) {
    const existing = await this._floorRepo.findByFloorNumber(data.floorNumber);
    if (existing) throw { status: 409, message: `Floor ${data.floorNumber} already exists` };

    const slots = [];
    const { twoWheelerSlots = 0, fourWheelerSlots = 0, heavyDutySlots = 0 } = data;
    let counter = 1;

    for (let i = 0; i < twoWheelerSlots; i++) {
      slots.push({ slotNumber: `F${data.floorNumber}-2W-${String(counter++).padStart(3,"0")}`, vehicleType: "two_wheeler", isOccupied: false });
    }
    for (let i = 0; i < fourWheelerSlots; i++) {
      slots.push({ slotNumber: `F${data.floorNumber}-4W-${String(counter++).padStart(3,"0")}`, vehicleType: "four_wheeler", isOccupied: false });
    }
    for (let i = 0; i < heavyDutySlots; i++) {
      slots.push({ slotNumber: `F${data.floorNumber}-HD-${String(counter++).padStart(3,"0")}`, vehicleType: "heavy_duty", isOccupied: false });
    }

    return this._floorRepo.create({
      floorNumber: data.floorNumber,
      floorName: data.floorName,
      totalSlots: slots.length,
      slots,
    });
  }

  async updateFloor(id, data) {
    const floor = await this._floorRepo.findById(id);
    if (!floor) throw { status: 404, message: "Floor not found" };
    return this._floorRepo.update(id, data);
  }

  async deleteFloor(id) {
    const floor = await this._floorRepo.findById(id);
    if (!floor) throw { status: 404, message: "Floor not found" };
    return this._floorRepo.update(id, { isActive: false });
  }

  async getOccupancySummary() {
    return this._floorRepo.getOccupancySummary();
  }

  async findAvailableSlot(floorId, vehicleType) {
    return this._floorRepo.findAvailableSlot(floorId, vehicleType);
  }

  async updateSlotOccupancy(floorId, slotId, isOccupied) {
    return this._floorRepo.updateSlotOccupancy(floorId, slotId, isOccupied);
  }
}

module.exports = FloorService;
