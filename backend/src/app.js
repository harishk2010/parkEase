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
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    this.app.use(
      cors({
        origin: function (origin, callback) {
          // allow requests with no origin (Postman, Railway health checks, curl)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) return callback(null, true);
          return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan("dev"));
  }

  _initRoutes() {
    this.app.get("/api/health", (req, res) =>
      res.json({
        success: true,
        message: "Parking Management API is running",
        timestamp: new Date(),
      })
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
