require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Flat folder structure - all files in same directory
const assistantRoutes = require("./assistant");
const productsRoutes = require("./products");
const analysisRoutes = require("./analysis");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// CORS - allow all origins for simplicity
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api/", limiter);

// Routes
app.use("/api/assistant", assistantRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/analysis", analysisRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EcoShop AI Backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`\n🌿 EcoShop AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 API docs available at http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
