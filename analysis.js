const express = require("express");
const router = express.Router();
const { analyzeProduct } = require("../services/aiService");

/**
 * POST /api/analysis/product
 * Body: { name, brand, category, description }
 * Returns: detailed eco analysis from AI
 */
router.post("/product", async (req, res) => {
  try {
    const { name, brand, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Product name is required." });
    }

    const analysis = await analyzeProduct({ name, brand, category, description });

    // Add grade color helper
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
    res.status(500).json({ error: "Failed to analyze product. Please try again." });
  }
});

/**
 * POST /api/analysis/compare
 * Body: { products: [{name, brand, category, description}] }
 * Analyzes multiple products and returns comparison
 */
router.post("/compare", async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length < 2) {
      return res.status(400).json({ error: "Provide at least 2 products to compare." });
    }

    if (products.length > 4) {
      return res.status(400).json({ error: "Maximum 4 products can be compared at once." });
    }

    const analyses = await Promise.all(
      products.map((p) => analyzeProduct(p).catch(() => null))
    );

    const valid = analyses.filter(Boolean);
    const winner = valid.reduce((best, curr) =>
      curr.ecoScore > (best?.ecoScore || 0) ? curr : best, null
    );

    res.json({
      results: analyses,
      winner: winner ? { name: products[analyses.indexOf(winner)]?.name, ...winner } : null,
      comparedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Compare error:", err);
    res.status(500).json({ error: "Failed to compare products." });
  }
});

/**
 * GET /api/analysis/impact-calculator
 * Query: ?bottles=10&bags=5&cups=20
 * Returns environmental savings from switching to eco products
 */
router.get("/impact-calculator", (req, res) => {
  const {
    plasticBottles = 0,
    plasticBags = 0,
    disposableCups = 0,
    paperTowels = 0,
  } = req.query;

  const impacts = {
    plasticBottlesSaved: parseInt(plasticBottles),
    plasticBagsSaved: parseInt(plasticBags),
    disposableCupsSaved: parseInt(disposableCups),
    paperTowelsSaved: parseInt(paperTowels),
  };

  // CO2 equivalents (kg per unit, approximate)
  const CO2 = {
    plasticBottle: 0.083,
    plasticBag: 0.008,
    disposableCup: 0.011,
    paperTowel: 0.015,
  };

  const totalCO2Saved =
    impacts.plasticBottlesSaved * CO2.plasticBottle +
    impacts.plasticBagsSaved * CO2.plasticBag +
    impacts.disposableCupsSaved * CO2.disposableCup +
    impacts.paperTowelsSaved * CO2.paperTowel;

  // Fun equivalents
  const treeDays = (totalCO2Saved / 0.022).toFixed(1); // avg tree absorbs 22g CO2/day
  const carKm = (totalCO2Saved / 0.21).toFixed(1);     // avg car emits 210g CO2/km

  res.json({
    inputs: impacts,
    totalCO2SavedKg: parseFloat(totalCO2Saved.toFixed(3)),
    equivalents: {
      treeDaysOfAbsorption: parseFloat(treeDays),
      carKmNotDriven: parseFloat(carKm),
    },
    message: `By making these swaps, you'd save ${totalCO2Saved.toFixed(2)} kg of CO₂ — equivalent to ${treeDays} days of a tree's work! 🌳`,
  });
});

module.exports = router;
