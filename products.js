const express = require("express");
const router = express.Router();
const { getEcoAlternatives } = require("./aiService");

// Indian eco-friendly products with direct buy links
const PRODUCTS = [
  {
    id: "p001",
    name: "Bamboo Toothbrush Set",
    brand: "Bare Necessities",
    category: "Personal Care",
    price: 299,
    currency: "₹",
    ecoScore: 9,
    image: "🪥",
    certifications: ["FSC Certified", "Vegan"],
    description: "Pack of 4 biodegradable bamboo toothbrushes with BPA-free bristles.",
    carbonKg: 0.2,
    tags: ["zero-waste", "biodegradable", "plastic-free"],
    buyLink: "https://www.amazon.in/s?k=bamboo+toothbrush+bare+necessities",
  },
  {
    id: "p002",
    name: "Reusable Beeswax Wraps",
    brand: "Sow and Grow",
    category: "Kitchen",
    price: 499,
    currency: "₹",
    ecoScore: 9,
    image: "🍯",
    certifications: ["USDA Organic"],
    description: "Natural beeswax food wraps replacing plastic cling film. Lasts 1 year.",
    carbonKg: 0.5,
    tags: ["zero-waste", "reusable", "plastic-free"],
    buyLink: "https://www.amazon.in/s?k=beeswax+food+wraps+india",
  },
  {
    id: "p003",
    name: "Organic Cotton Tote Bag",
    brand: "Rustic Hue",
    category: "Accessories",
    price: 349,
    currency: "₹",
    ecoScore: 8,
    image: "👜",
    certifications: ["GOTS Certified", "Fair Trade"],
    description: "Heavy-duty organic cotton tote. Replaces ~500 plastic bags over lifetime.",
    carbonKg: 1.8,
    tags: ["reusable", "organic", "fair-trade"],
    buyLink: "https://www.flipkart.com/search?q=organic+cotton+tote+bag",
  },
  {
    id: "p004",
    name: "Solar Powered Charger",
    brand: "Loom Solar",
    category: "Electronics",
    price: 2499,
    currency: "₹",
    ecoScore: 8,
    image: "☀️",
    certifications: ["BIS Certified"],
    description: "Portable 20W solar panel charger. Powers phones and small devices sustainably.",
    carbonKg: 12.0,
    tags: ["renewable-energy", "portable", "off-grid"],
    buyLink: "https://www.amazon.in/s?k=loom+solar+portable+charger",
  },
  {
    id: "p005",
    name: "Compostable Phone Case",
    brand: "Urth",
    category: "Electronics",
    price: 1299,
    currency: "₹",
    ecoScore: 8,
    image: "📱",
    certifications: ["Compostable Certified"],
    description: "Made from plant-based bioplastics. Fully compostable within 2 years.",
    carbonKg: 0.8,
    tags: ["compostable", "plant-based", "biodegradable"],
    buyLink: "https://www.amazon.in/s?k=compostable+phone+case+india",
  },
  {
    id: "p006",
    name: "Stainless Steel Water Bottle",
    brand: "Milton",
    category: "Kitchen",
    price: 599,
    currency: "₹",
    ecoScore: 9,
    image: "🥤",
    certifications: ["BPA-Free", "ISI Marked"],
    description: "Double-wall insulated bottle. Eliminates ~156 plastic bottles per year.",
    carbonKg: 3.5,
    tags: ["reusable", "plastic-free", "zero-waste"],
    buyLink: "https://www.amazon.in/s?k=milton+stainless+steel+water+bottle",
  },
  {
    id: "p007",
    name: "Recycled Cotton Jacket",
    brand: "No Nasties",
    category: "Clothing",
    price: 2999,
    currency: "₹",
    ecoScore: 7,
    image: "🧥",
    certifications: ["GOTS Certified", "Fair Trade"],
    description: "100% organic and fair trade certified jacket made in India.",
    carbonKg: 8.0,
    tags: ["recycled-materials", "circular-fashion", "fair-trade"],
    buyLink: "https://nonasties.in",
  },
  {
    id: "p008",
    name: "Natural Dish Soap Bar",
    brand: "Krya",
    category: "Cleaning",
    price: 225,
    currency: "₹",
    ecoScore: 9,
    image: "🧼",
    certifications: ["Vegan", "Cruelty-Free"],
    description: "Zero-waste dish soap bar. Plastic-free packaging, biodegradable formula.",
    carbonKg: 0.3,
    tags: ["zero-waste", "vegan", "cruelty-free", "plastic-free"],
    buyLink: "https://www.kryaproducts.com",
  },
  {
    id: "p009",
    name: "Jute Shopping Bag",
    brand: "Greentree",
    category: "Accessories",
    price: 199,
    currency: "₹",
    ecoScore: 9,
    image: "🛍️",
    certifications: ["Natural Fiber"],
    description: "100% natural jute bag, strong and fully biodegradable. Made in India.",
    carbonKg: 0.4,
    tags: ["biodegradable", "natural", "reusable"],
    buyLink: "https://www.amazon.in/s?k=jute+shopping+bag+india",
  },
  {
    id: "p010",
    name: "Copper Water Bottle",
    brand: "Indian Bartan",
    category: "Kitchen",
    price: 449,
    currency: "₹",
    ecoScore: 9,
    image: "🏺",
    certifications: ["Pure Copper", "Ayurveda Approved"],
    description: "Traditional copper bottle with health benefits. Lasts decades, zero plastic.",
    carbonKg: 2.1,
    tags: ["traditional", "zero-waste", "reusable", "health"],
    buyLink: "https://www.amazon.in/s?k=copper+water+bottle+pure",
  },
  {
    id: "p011",
    name: "Bamboo Cutlery Set",
    brand: "Eco Concepts",
    category: "Kitchen",
    price: 299,
    currency: "₹",
    ecoScore: 9,
    image: "🥢",
    certifications: ["Biodegradable", "FSC Certified"],
    description: "Reusable bamboo fork, spoon, knife, chopsticks. Replace plastic cutlery forever.",
    carbonKg: 0.3,
    tags: ["biodegradable", "zero-waste", "plastic-free"],
    buyLink: "https://www.amazon.in/s?k=bamboo+cutlery+set+india",
  },
  {
    id: "p012",
    name: "Organic Neem Toothpaste",
    brand: "Vicco",
    category: "Personal Care",
    price: 149,
    currency: "₹",
    ecoScore: 8,
    image: "🌿",
    certifications: ["Ayurvedic", "No SLS"],
    description: "Natural neem-based toothpaste in recyclable packaging. Made in India.",
    carbonKg: 0.2,
    tags: ["natural", "ayurvedic", "plastic-free"],
    buyLink: "https://www.amazon.in/s?k=vicco+neem+toothpaste",
  },
  {
    id: "p013",
    name: "Recycled Paper Notebook",
    brand: "Paperkraft",
    category: "Stationery",
    price: 120,
    currency: "₹",
    ecoScore: 8,
    image: "📓",
    certifications: ["Recycled Paper", "FSC Certified"],
    description: "100% recycled paper notebook. Save trees with every purchase.",
    carbonKg: 0.5,
    tags: ["recycled-materials", "zero-waste"],
    buyLink: "https://www.amazon.in/s?k=recycled+paper+notebook+india",
  },
  {
    id: "p014",
    name: "Solar LED Study Lamp",
    brand: "Wipro Lighting",
    category: "Electronics",
    price: 1299,
    currency: "₹",
    ecoScore: 8,
    image: "💡",
    certifications: ["BEE 5 Star", "BIS"],
    description: "Solar powered LED lamp. Zero electricity cost, ideal for rural India.",
    carbonKg: 5.0,
    tags: ["renewable-energy", "energy-saving", "solar"],
    buyLink: "https://www.amazon.in/s?k=solar+led+study+lamp+india",
  },
  {
    id: "p015",
    name: "Khadi Cotton Kurta",
    brand: "Khadi India",
    category: "Clothing",
    price: 799,
    currency: "₹",
    ecoScore: 10,
    image: "👕",
    certifications: ["Khadi Mark", "Handloom"],
    description: "Handspun, handwoven khadi cotton. Supports Indian artisans, zero industrial pollution.",
    carbonKg: 1.2,
    tags: ["handmade", "natural", "fair-trade", "organic"],
    buyLink: "https://www.khadiindia.gov.in",
  },
  {
    id: "p016",
    name: "Compost Bin for Home",
    brand: "Daily Dump",
    category: "Home & Garden",
    price: 999,
    currency: "₹",
    ecoScore: 10,
    image: "🗑️",
    certifications: ["Made in India"],
    description: "Terracotta home composting kit. Turn kitchen waste into garden gold.",
    carbonKg: 1.5,
    tags: ["zero-waste", "composting", "gardening"],
    buyLink: "https://www.dailydump.org",
  },
];

// GET /api/products
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
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.includes(q))
    );
  }
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
    results = results.filter((p) => tagList.some((tag) => p.tags.includes(tag)));
  }

  res.json({ total: results.length, products: results });
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// GET /api/products/categories/list
router.get("/categories/list", (req, res) => {
  const categories = [...new Set(PRODUCTS.map((p) => p.category))];
  res.json({ categories });
});

// POST /api/products/alternatives
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
