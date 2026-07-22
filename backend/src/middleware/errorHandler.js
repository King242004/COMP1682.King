function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.name === "MulterError") {
    const tooLarge = err.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      message: tooLarge ? "Image is too large." : "Invalid image upload.",
    });
  }
  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id." });
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid request body." });
  if (err.type === "entity.too.large") return res.status(413).json({ message: "Request body is too large." });

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

module.exports = errorHandler;
