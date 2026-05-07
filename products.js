const express = require("express");
const router = express.Router();
const { getEcoAlternatives } = require("./aiService");

// Mock product database with eco metadata
const PRODUCTS = [
  {
    id: "p001",
    name: "Bamboo Toothbrush Set",
    brand: "EcoSmile",
    category: "Personal Care",
    price: 12.99,
    ecoScore: 9,
    image: "🪥",
    certifications: ["FSC Certified", "Vegan"],
    description: "Pack of 4 biodegradable bamboo toothbrushes with BPA-free bristles.",
    carbonKg: 0.2,
    tags: ["zero-waste", "biodegradable", "plastic-free"],
  },
  {
    id: "p002",
    name: "Reusable Beeswax Wraps",
    brand: "BeeGreen",
    category: "Kitchen",
    price: 18.5,
    ecoScore: 9,
    image: "🍯",
    certifications: ["USDA Organic", "B Corp"],
    description: "Natural beeswax food wraps, replacing plastic cling film. Lasts 1 year.",
    carbonKg: 0.5,
    tags: ["zero-waste", "reusable", "plastic-free"],
  },
  {
    id: "p003",
    name: "Organic Cotton Tote Bag",
    brand: "GreenCarry",
    category: "Accessories",
    price: 9.99,
    ecoScore: 8,
    image: "👜",
    certifications: ["GOTS Certified", "Fair Trade"],
    description: "Heavy-duty organic cotton tote. Replaces ~500 plastic bags over its lifetime.",
    carbonKg: 1.8,
    tags: ["reusable", "organic", "fair-trade"],
  },
  {
    id: "p004",
    name: "Solar Powered Charger",
    brand: "SunCharge",
    category: "Electronics",
    price: 45.0,
    ecoScore: 8,
    image: "☀️",
    certifications: ["Energy Star"],
    description: "Portable 20W solar panel charger. Powers phones and small devices sustainably.",
    carbonKg: 12.0,
    tags: ["renewable-energy", "portable", "off-grid"],
  },
  {
    id: "p005",
    name: "Compostable Phone Case",
    brand: "EcoCase",
    category: "Electronics",
    price: 29.99,
    ecoScore: 8,
    image: "📱",
    certifications: ["TÜV Certified Compostable"],
    description: "Made from plant-based bioplastics. Fully compostable within 2 years.",
    carbonKg: 0.8,
    tags: ["compostable", "plant-based", "biodegradable"],
  },
  {
    id: "p006",
    name: "Stainless Steel Water Bottle",
    brand: "HydroEco",
    category: "Kitchen",
    price: 24.99,
    ecoScore: 9,
    image: "🥤",
    certifications: ["BPA-Free", "Lifetime Warranty"],
    description: "Double-wall insulated bottle. Eliminates ~156 plastic bottles per year.",
    carbonKg: 3.5,
    tags: ["reusable", "plastic-free", "zero-waste"],
  },
  {
    id: "p007",
    name: "Recycled Polyester Jacket",
    brand: "ReWear",
    category: "Clothing",
    price: 89.0,
    ecoScore: 7,
    image: "🧥",
    certifications: ["GRS Certified", "Bluesign"],
    description: "Made from 30 recycled plastic bottles. Warm, durable, and circular.",
    carbonKg: 8.0,
    tags: ["recycled-materials", "circular-fashion"],
  },
  {
    id: "p008",
    name: "Natural Dish Soap Bar",
    brand: "PureWash",
    category: "Cleaning",
    price: 7.5,
    ecoScore: 9,
    image: "🧼",
    certifications: ["Leaping Bunny", "Vegan"],
    description: "Zero-waste dish soap bar. Plastic-free packaging, biodegradable formula.",
    carbonKg: 0.3,
    tags: ["zero-waste", "vegan", "cruelty-free", "plastic-free"],
  },
];

/**
 * GET /api/products
 * Query: ?category=Kitchen&minEcoScore=7&search=bottle
 */
router.get("/", (req, res) => {
  const { category, minEcoScore, search, tags } = req.query;
  let results = [...PRODUCTS];

  if (category) {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }
  if (minEcoScore) {
    results = results.filter((p) => p.ecoScore >= parseInt(minEcoScore));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
    results = results.filter((p) => tagList.some((tag) => p.tags.includes(tag)));
  }

  res.json({
    total: results.length,
    products: results,
  });
});

/**
 * GET /api/products/:id
 */
router.get("/:id", (req, res) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

/**
 * GET /api/products/categories/list
 */
router.get("/categories/list", (req, res) => {
  const categories = [...new Set(PRODUCTS.map((p) => p.category))];
  res.json({ categories });
});

/**
 * POST /api/products/alternatives
 * Body: { category: string, budget: "low"|"medium"|"high" }
 */
router.post("/alternatives", async (req, res) => {
  try {
    const { category, budget = "medium" } = req.body;
    if (!category) return res.status(400).json({ error: "category is required" });

    const alternatives = await getEcoAlternatives(category, budget);
    res.json(alternatives);
  } catch (err) {
    console.error("Alternatives error:", err);
    res.status(500).json({ error: "Failed to get eco alternatives." });
  }
});

module.exports = router;
