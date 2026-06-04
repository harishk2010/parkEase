const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const ErrorHandler = require("./middleware/errorHandler");

const floorRoutes = require("./routes/floorRoutes");
const vehicleTypeRoutes = require("./routes/vehicleTypeRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

class App {
  constructor() {
    this.app = express();
    this._initMiddleware();
    this._initRoutes();
    this._initErrorHandling();
  }

  _initMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan("dev"));
  }

  _initRoutes() {
    this.app.get("/api/health", (req, res) =>
      res.json({ success: true, message: "Parking Management API is running", timestamp: new Date() })
    );
    this.app.use("/api/floors", floorRoutes);
    this.app.use("/api/vehicle-types", vehicleTypeRoutes);
    this.app.use("/api/tickets", ticketRoutes);
    this.app.use("/api/payments", paymentRoutes);
  }

  _initErrorHandling() {
    this.app.use(ErrorHandler.notFound);
    this.app.use(ErrorHandler.handle);
  }

  getApp() {
    return this.app;
  }
}

module.exports = new App().getApp();
