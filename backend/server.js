require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");
const connectDB = require("./src/config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/meals", require("./src/routes/meal"));
app.use("/api/profile", require("./src/routes/profile"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/scan", require("./src/routes/scan"));
app.use("/api/community", require("./src/routes/community"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => res.json({ message: "HealthySnap API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
