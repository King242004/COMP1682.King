const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { getEmailStatus } = require("./config/mailer");
const errorHandler = require("./middleware/errorHandler");
const { authLimiter } = require("./middleware/rateLimiters");

function corsOptions() {
  const allowedOrigins = String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      const error = new Error("Origin is not allowed.");
      error.status = 403;
      callback(error);
    },
  };
}

function createApp() {
  const app = express();

  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
  app.disable("x-powered-by");
  // This service only returns JSON except Swagger UI. CSP is left off so the
  // generated Swagger page can run its inline assets; all other Helmet headers stay enabled.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors(corsOptions()));

  // Coach photos arrive as base64 JSON. Keep the larger parser scoped only to
  // this route; normal API requests stay capped at 1 MB.
  app.use("/api/coach", express.json({ limit: "8mb" }), require("./routes/coach"));
  app.use(express.json({ limit: "1mb" }));

  app.use("/api/auth", authLimiter, require("./routes/auth"));
  app.use("/api/meals", require("./routes/meal"));
  app.use("/api/plan", require("./routes/plan"));
  app.use("/api/exercise", require("./routes/exercise"));
  app.use("/api/weight", require("./routes/weight"));
  app.use("/api/profile", require("./routes/profile"));
  app.use("/api/user", require("./routes/user"));
  app.use("/api/scan", require("./routes/scan"));
  app.use("/api/community", require("./routes/community"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/", (req, res) => {
    const emailStatus = getEmailStatus();
    res.json({
      message: "MealMate API running",
      version: process.env.RENDER_GIT_COMMIT?.slice(0, 8) || "local",
      emailProvider: emailStatus.provider,
      emailConfigured: emailStatus.configured,
    });
  });

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
