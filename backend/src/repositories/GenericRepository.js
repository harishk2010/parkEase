const IRepository = require("../interfaces/IRepository");

class GenericRepository extends IRepository {
  constructor(model) {
    super();
    this._model = model;
  }

  async findAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit, skip, populate } = options;
    let query = this._model.find(filter).sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    if (populate) query = query.populate(populate);
    return query.lean();
  }

  async findById(id, populate) {
    let query = this._model.findById(id);
    if (populate) query = query.populate(populate);
    return query.lean();
  }

  async findOne(filter, populate) {
    let query = this._model.findOne(filter);
    if (populate) query = query.populate(populate);
    return query.lean();
  }

  async create(data) {
    const doc = new this._model(data);
    return (await doc.save()).toObject();
  }

  async update(id, data) {
    return this._model
      .findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .lean();
  }

  async delete(id) {
    return this._model.findByIdAndDelete(id).lean();
  }

  async count(filter = {}) {
    return this._model.countDocuments(filter);
  }
}

module.exports = GenericRepository;
