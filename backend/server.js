require("dotenv").config();
const connectDB = require("./src/config/db");
const { validateEnvironment } = require("./src/config/env");
const { createApp } = require("./src/app");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const { warnings } = validateEnvironment();
    warnings.forEach((warning) => console.warn(`Environment warning: ${warning}`));
    await connectDB();
    const app = createApp();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
}

startServer();
