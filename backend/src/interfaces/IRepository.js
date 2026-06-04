/**
 * IRepository - Generic Repository Interface
 * All concrete repositories must extend this class.
 */
class IRepository {
  async findAll(filter = {}, options = {}) {
    throw new Error("findAll() not implemented");
  }
  async findById(id) {
    throw new Error("findById() not implemented");
  }
  async findOne(filter) {
    throw new Error("findOne() not implemented");
  }
  async create(data) {
    throw new Error("create() not implemented");
  }
  async update(id, data) {
    throw new Error("update() not implemented");
  }
  async delete(id) {
    throw new Error("delete() not implemented");
  }
  async count(filter = {}) {
    throw new Error("count() not implemented");
  }
}

module.exports = IRepository;
