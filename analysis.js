const express = require("express");
const router = express.Router();
const { analyzeProduct } = require("./aiService");

router.post("/product", async (req, res) => {
  try {
    const { name, brand, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Product name is required." });
    }

    const analysis = await analyzeProduct({ name, brand, category, description });

    const gradeColors = {
      "A+": "#00c853", A: "#43a047", B: "#8bc34a",
      C: "#ffc107", D: "#ff7043", F: "#f44336",
    };

    res.json({
      ...analysis,
      gradeColor: gradeColors[analysis.grade] || "#888",
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Analysis error:", err.message);
    res.status(500).json({ error: "Failed to analyze product: " + err.message });
  }
});

router.get("/impact-calculator", (req, res) => {
  const {
    plasticBottles = 0,
    plasticBags = 0,
    disposableCups = 0,
    paperTowels = 0,
  } = req.query;

  const CO2 = {
    plasticBottle: 0.083,
    plasticBag: 0.008,
    disposableCup: 0.011,
    paperTowel: 0.015,
  };

  const totalCO2Saved =
    parseInt(plasticBottles) * CO2.plasticBottle +
    parseInt(plasticBags) * CO2.plasticBag +
    parseInt(disposableCups) * CO2.disposableCup +
    parseInt(paperTowels) * CO2.paperTowel;

  const treeDays = (totalCO2Saved / 0.022).toFixed(1);
  const carKm = (totalCO2Saved / 0.21).toFixed(1);

  res.json({
    totalCO2SavedKg: parseFloat(totalCO2Saved.toFixed(3)),
    equivalents: {
      treeDaysOfAbsorption: parseFloat(treeDays),
      carKmNotDriven: parseFloat(carKm),
    },
    message: `By making these swaps, you'd save ${totalCO2Saved.toFixed(2)} kg of CO₂ — equivalent to ${treeDays} days of a tree's work! 🌳`,
  });
});

module.exports = router;
