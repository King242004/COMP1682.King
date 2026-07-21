require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const connectDB = require("./src/config/db");

const app = express();

app.use(cors());
// Larger limit so base64 food photos sent to the AI coach chat fit (default is 100kb)
app.use(express.json({ limit: "15mb" }));

// Brute-force guard: cap login/register attempts per IP (other routes are
// JWT-protected so they don't need this).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts — please try again later." },
});

app.use("/api/auth", authLimiter, require("./src/routes/auth"));
app.use("/api/meals", require("./src/routes/meal"));
app.use("/api/plan", require("./src/routes/plan"));
app.use("/api/exercise", require("./src/routes/exercise"));
app.use("/api/weight", require("./src/routes/weight"));
app.use("/api/coach", require("./src/routes/coach"));
app.use("/api/profile", require("./src/routes/profile"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/scan", require("./src/routes/scan"));
app.use("/api/community", require("./src/routes/community"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) =>
  res.json({
    message: "MealMate API running",
    version: process.env.RENDER_GIT_COMMIT?.slice(0, 8) || "local",
    emailProvider: "brevo",
    emailConfigured: Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL),
  })
);

// Global error handler — MUST stay after all routes. Express 5 forwards
// rejected promises from async handlers here; without this, an unexpected
// error (bad ObjectId → CastError, DB down, ...) returns an HTML page that
// the app's JSON client can't parse.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid id." });
  if (err.type === "entity.parse.failed" || err.type === "entity.too.large")
    return res.status(400).json({ message: "Invalid request body." });
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
