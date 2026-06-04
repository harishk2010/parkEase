class ErrorHandler {
  static handle(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[ERROR] ${req.method} ${req.url} - ${status}: ${message}`);

    res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  static notFound(req, res) {
    res.status(404).json({ success: false, message: `Route ${req.url} not found` });
  }
}

module.exports = ErrorHandler;
