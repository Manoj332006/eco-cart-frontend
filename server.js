require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const assistantRoutes = require("./assistant");
const productsRoutes = require("./products");
const analysisRoutes = require("./analysis");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use("/api/assistant", assistantRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/analysis", analysisRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EcoShop AI Backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🌿 EcoShop AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
