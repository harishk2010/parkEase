require("dotenv").config();
const app = require("./app");
const database = require("./config/database");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/parking_management";

const startServer = async () => {
  await database.connect(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
