const mongoose = require("mongoose");

class Database {
  constructor() {
    this._connection = null;
  }

  async connect(uri) {
    if (this._connection) return this._connection;
    try {
      this._connection = await mongoose.connect(uri);
      console.log(`[DB] MongoDB connected: ${mongoose.connection.host}`);
      return this._connection;
    } catch (error) {
      console.error("[DB] Connection error:", error.message);
      process.exit(1);
    }
  }

  disconnect() {
    return mongoose.disconnect();
  }
}

module.exports = new Database();
