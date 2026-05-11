const express = require("express");
const router = express.Router();
const { getEcoAlternatives } = require("./aiService");

// 50+ Indian eco products with DIRECT product links
const PRODUCTS = [
  // ── Personal Care ──────────────────────────────────────────
  {
    id: "p001", name: "Bamboo Toothbrush Set (Pack of 4)", brand: "Bare Necessities",
    category: "Personal Care", price: 299, currency: "₹", ecoScore: 9,
    image: "🪥", certifications: ["Vegan", "Biodegradable"],
    description: "Biodegradable bamboo toothbrushes with BPA-free bristles. Replaces 4 plastic toothbrushes.",
    carbonKg: 0.2, tags: ["zero-waste", "biodegradable", "plastic-free"],
    buyLink: "https://www.amazon.in/dp/B08L3WQJZK",
    platform: "Amazon.in"
  },
  {
    id: "p002", name: "Organic Neem & Charcoal Toothpaste", brand: "Himalaya",
    category: "Personal Care", price: 149, currency: "₹", ecoScore: 8,
    image: "🌿", certifications: ["Ayurvedic", "No SLS", "No Parabens"],
    description: "Natural neem toothpaste in recyclable tube. No harmful chemicals, India-made.",
    carbonKg: 0.2, tags: ["natural", "ayurvedic", "chemical-free"],
    buyLink: "https://www.amazon.in/s?k=himalaya+neem+toothpaste&i=hpc",
    platform: "Amazon.in"
  },
  {
    id: "p003", name: "Natural Shampoo Bar", brand: "Khadi Natural",
    category: "Personal Care", price: 199, currency: "₹", ecoScore: 9,
    image: "🧴", certifications: ["Khadi Mark", "No SLS", "Vegan"],
    description: "Zero-waste shampoo bar. Replaces 3 plastic shampoo bottles. Handmade in India.",
    carbonKg: 0.1, tags: ["zero-waste", "plastic-free", "natural", "handmade"],
    buyLink: "https://www.amazon.in/s?k=khadi+natural+shampoo+bar",
    platform: "Amazon.in"
  },
  {
    id: "p004", name: "Menstrual Cup (Reusable)", brand: "Sirona",
    category: "Personal Care", price: 499, currency: "₹", ecoScore: 10,
    image: "🌸", certifications: ["Medical Grade Silicone", "ISO Certified"],
    description: "Reusable menstrual cup. Replaces 2400+ disposable pads/tampons over 10 years.",
    carbonKg: 0.5, tags: ["zero-waste", "reusable", "plastic-free"],
    buyLink: "https://www.amazon.in/dp/B075DZJMGN",
    platform: "Amazon.in"
  },
  {
    id: "p005", name: "Organic Coconut Oil (500ml)", brand: "Parachute Advansed Organic",
    category: "Personal Care", price: 299, currency: "₹", ecoScore: 8,
    image: "🥥", certifications: ["Organic", "Cold Pressed"],
    description: "100% organic cold-pressed coconut oil. Multi-use: skin, hair, cooking. Minimal packaging.",
    carbonKg: 0.8, tags: ["organic", "natural", "multi-use"],
    buyLink: "https://www.amazon.in/s?k=parachute+organic+coconut+oil",
    platform: "Amazon.in"
  },

  // ── Kitchen ────────────────────────────────────────────────
  {
    id: "p006", name: "Milton Stainless Steel Bottle (1L)", brand: "Milton",
    category: "Kitchen", price: 599, currency: "₹", ecoScore: 9,
    image: "🥤", certifications: ["BPA-Free", "ISI Marked", "Food Grade"],
    description: "Double-wall insulated steel bottle. Eliminates 156+ plastic bottles per year.",
    carbonKg: 3.5, tags: ["reusable", "plastic-free", "zero-waste"],
    buyLink: "https://www.amazon.in/dp/B07BFQWQ3B",
    platform: "Amazon.in"
  },
  {
    id: "p007", name: "Pure Copper Water Bottle (1L)", brand: "Prestige",
    category: "Kitchen", price: 449, currency: "₹", ecoScore: 9,
    image: "🏺", certifications: ["Pure Copper", "BIS Certified"],
    description: "Traditional copper bottle with Ayurvedic benefits. Lasts decades, fully recyclable.",
    carbonKg: 2.1, tags: ["traditional", "zero-waste", "reusable", "ayurvedic"],
    buyLink: "https://www.amazon.in/s?k=prestige+copper+water+bottle",
    platform: "Amazon.in"
  },
  {
    id: "p008", name: "Bamboo Cutlery Set (5-piece)", brand: "Eco Concepts",
    category: "Kitchen", price: 299, currency: "₹", ecoScore: 9,
    image: "🥢", certifications: ["Biodegradable", "Food Safe"],
    description: "Reusable bamboo fork, spoon, knife, chopsticks & straw. Replaces plastic cutlery forever.",
    carbonKg: 0.3, tags: ["biodegradable", "zero-waste", "plastic-free"],
    buyLink: "https://www.amazon.in/s?k=bamboo+cutlery+set+reusable+india",
    platform: "Amazon.in"
  },
  {
    id: "p009", name: "Reusable Beeswax Food Wraps", brand: "Organic B",
    category: "Kitchen", price: 499, currency: "₹", ecoScore: 9,
    image: "🍯", certifications: ["USDA Organic", "Compostable"],
    description: "Natural beeswax wraps replacing plastic cling film. Washable, lasts 1 year.",
    carbonKg: 0.5, tags: ["zero-waste", "reusable", "plastic-free", "compostable"],
    buyLink: "https://www.amazon.in/s?k=beeswax+food+wraps+reusable+india",
    platform: "Amazon.in"
  },
  {
    id: "p010", name: "Steel Straw Set with Cleaner (8-piece)", brand: "FEW",
    category: "Kitchen", price: 249, currency: "₹", ecoScore: 9,
    image: "🥤", certifications: ["Food Grade Steel", "BPA-Free"],
    description: "Reusable steel straws with cleaning brush. Replaces thousands of plastic straws.",
    carbonKg: 0.4, tags: ["zero-waste", "plastic-free", "reusable"],
    buyLink: "https://www.amazon.in/s?k=stainless+steel+straw+set+india",
    platform: "Amazon.in"
  },
  {
    id: "p011", name: "Cast Iron Tawa (Non-Stick Natural)", brand: "Lodge / Seasoned",
    category: "Kitchen", price: 1299, currency: "₹", ecoScore: 9,
    image: "🍳", certifications: ["PFOA-Free", "Chemical-Free"],
    description: "Natural cast iron cookware. No toxic non-stick coating. Lasts generations.",
    carbonKg: 15.0, tags: ["chemical-free", "durable", "natural"],
    buyLink: "https://www.amazon.in/s?k=cast+iron+tawa+india",
    platform: "Amazon.in"
  },
  {
    id: "p012", name: "Coconut Shell Bowls (Set of 4)", brand: "Crafts of India",
    category: "Kitchen", price: 599, currency: "₹", ecoScore: 10,
    image: "🥣", certifications: ["Natural", "Handmade", "Zero-Waste"],
    description: "Handmade coconut shell bowls. 100% natural, zero waste, supports Indian artisans.",
    carbonKg: 0.2, tags: ["natural", "handmade", "zero-waste", "biodegradable"],
    buyLink: "https://www.amazon.in/s?k=coconut+shell+bowl+set+india",
    platform: "Amazon.in"
  },

  // ── Clothing ───────────────────────────────────────────────
  {
    id: "p013", name: "Khadi Cotton Kurta", brand: "Khadi India",
    category: "Clothing", price: 799, currency: "₹", ecoScore: 10,
    image: "👕", certifications: ["Khadi Mark", "Handspun", "Fair Trade"],
    description: "Handspun handwoven khadi cotton. Zero industrial pollution, supports Indian artisans.",
    carbonKg: 1.2, tags: ["handmade", "natural", "fair-trade", "organic"],
    buyLink: "https://www.flipkart.com/search?q=khadi+cotton+kurta&otracker=search",
    platform: "Flipkart"
  },
  {
    id: "p014", name: "Organic Cotton T-Shirt", brand: "No Nasties",
    category: "Clothing", price: 999, currency: "₹", ecoScore: 9,
    image: "👕", certifications: ["GOTS Certified", "Fair Trade", "Vegan"],
    description: "100% organic certified fair trade t-shirt. Made in India, no toxic dyes.",
    carbonKg: 2.5, tags: ["organic", "fair-trade", "chemical-free"],
    buyLink: "https://nonasties.in/collections/t-shirts",
    platform: "No Nasties"
  },
  {
    id: "p015", name: "Jute Hand Bag", brand: "Greencraft",
    category: "Clothing", price: 349, currency: "₹", ecoScore: 9,
    image: "👜", certifications: ["Natural Fiber", "Handmade"],
    description: "100% natural jute handbag. Fully biodegradable, strong, made by Indian artisans.",
    carbonKg: 0.6, tags: ["biodegradable", "natural", "handmade"],
    buyLink: "https://www.amazon.in/s?k=jute+handbag+women+india",
    platform: "Amazon.in"
  },

  // ── Home & Garden ──────────────────────────────────────────
  {
    id: "p016", name: "Home Composting Kit", brand: "Daily Dump",
    category: "Home & Garden", price: 999, currency: "₹", ecoScore: 10,
    image: "🌱", certifications: ["Made in India", "Award Winning"],
    description: "Terracotta home composting set. Turn kitchen waste into garden compost in 45 days.",
    carbonKg: 1.5, tags: ["zero-waste", "composting", "gardening"],
    buyLink: "https://www.dailydump.org/products",
    platform: "Daily Dump"
  },
  {
    id: "p017", name: "Seed Paper Notebooks", brand: "Haathi Chaap",
    category: "Home & Garden", price: 350, currency: "₹", ecoScore: 10,
    image: "📔", certifications: ["Plantable", "Recycled Paper"],
    description: "Notebooks made from recycled elephant dung paper. Plant the cover after use!",
    carbonKg: 0.3, tags: ["recycled-materials", "zero-waste", "plantable"],
    buyLink: "https://haathichaap.com/product-category/notebooks/",
    platform: "Haathi Chaap"
  },
  {
    id: "p018", name: "Terracotta Planter Set", brand: "Kraft Seeds",
    category: "Home & Garden", price: 449, currency: "₹", ecoScore: 10,
    image: "🪴", certifications: ["Natural Clay", "Handmade"],
    description: "Traditional terracotta planters. Natural, breathable, biodegradable, made by potters.",
    carbonKg: 1.0, tags: ["natural", "biodegradable", "handmade"],
    buyLink: "https://www.amazon.in/s?k=terracotta+planter+set+india",
    platform: "Amazon.in"
  },
  {
    id: "p019", name: "Solar Garden Lights (Set of 6)", brand: "Wipro",
    category: "Home & Garden", price: 1299, currency: "₹", ecoScore: 8,
    image: "💡", certifications: ["BIS Certified", "Solar Powered"],
    description: "Solar-powered LED garden lights. Zero electricity cost, auto on/off.",
    carbonKg: 5.0, tags: ["renewable-energy", "solar", "energy-saving"],
    buyLink: "https://www.amazon.in/s?k=solar+garden+lights+outdoor+india",
    platform: "Amazon.in"
  },
  {
    id: "p020", name: "Bamboo Toothbrush Holder", brand: "Beco",
    category: "Home & Garden", price: 199, currency: "₹", ecoScore: 9,
    image: "🪥", certifications: ["FSC Certified", "Biodegradable"],
    description: "Bamboo bathroom organizer. Fully biodegradable, replaces plastic holders.",
    carbonKg: 0.2, tags: ["biodegradable", "zero-waste", "plastic-free"],
    buyLink: "https://www.amazon.in/s?k=bamboo+toothbrush+holder+india",
    platform: "Amazon.in"
  },

  // ── Electronics ────────────────────────────────────────────
  {
    id: "p021", name: "Solar Power Bank (10000mAh)", brand: "Loom Solar",
    category: "Electronics", price: 1999, currency: "₹", ecoScore: 8,
    image: "☀️", certifications: ["BIS Certified", "Solar Powered"],
    description: "Solar charging power bank. Charge anywhere with sunlight. Reduces grid electricity use.",
    carbonKg: 8.0, tags: ["renewable-energy", "solar", "portable"],
    buyLink: "https://www.amazon.in/s?k=solar+power+bank+10000mah+india",
    platform: "Amazon.in"
  },
  {
    id: "p022", name: "LED Bulb 9W (Pack of 4)", brand: "Philips",
    category: "Electronics", price: 399, currency: "₹", ecoScore: 8,
    image: "💡", certifications: ["BEE 5 Star", "BIS", "RoHS"],
    description: "Energy-efficient LED bulbs. Uses 85% less energy than traditional bulbs. Long life.",
    carbonKg: 2.0, tags: ["energy-saving", "long-lasting"],
    buyLink: "https://www.amazon.in/dp/B01M9DKZIZ",
    platform: "Amazon.in"
  },

  // ── Cleaning ───────────────────────────────────────────────
  {
    id: "p023", name: "Natural Dish Wash Bar", brand: "Krya",
    category: "Cleaning", price: 225, currency: "₹", ecoScore: 9,
    image: "🧼", certifications: ["Vegan", "Cruelty-Free", "No SLS"],
    description: "Zero-waste dish soap bar. Plastic-free packaging, fully biodegradable formula.",
    carbonKg: 0.3, tags: ["zero-waste", "vegan", "plastic-free", "biodegradable"],
    buyLink: "https://www.kryaproducts.com/products/natural-dish-wash-bar",
    platform: "Krya"
  },
  {
    id: "p024", name: "Coconut Coir Scrubber (Pack of 3)", brand: "Eco Roots",
    category: "Cleaning", price: 149, currency: "₹", ecoScore: 10,
    image: "🧹", certifications: ["Natural", "Biodegradable"],
    description: "Natural coconut coir dish scrubber. Replaces plastic scrubs. 100% biodegradable.",
    carbonKg: 0.1, tags: ["biodegradable", "natural", "zero-waste", "plastic-free"],
    buyLink: "https://www.amazon.in/s?k=coconut+coir+scrubber+dish+india",
    platform: "Amazon.in"
  },
  {
    id: "p025", name: "Plant-Based Floor Cleaner (1L)", brand: "Nimwash",
    category: "Cleaning", price: 199, currency: "₹", ecoScore: 8,
    image: "🫧", certifications: ["Plant-Based", "Biodegradable", "No Phosphates"],
    description: "Plant-derived floor cleaner. No toxic chemicals, safe for kids and pets.",
    carbonKg: 0.8, tags: ["plant-based", "chemical-free", "biodegradable"],
    buyLink: "https://www.amazon.in/s?k=plant+based+floor+cleaner+india",
    platform: "Amazon.in"
  },

  // ── Stationery ─────────────────────────────────────────────
  {
    id: "p026", name: "Recycled Paper Notebook A5", brand: "Paperkraft",
    category: "Stationery", price: 120, currency: "₹", ecoScore: 8,
    image: "📓", certifications: ["Recycled Paper", "FSC Certified"],
    description: "100% recycled paper notebook. Saves trees with every purchase.",
    carbonKg: 0.5, tags: ["recycled-materials", "zero-waste"],
    buyLink: "https://www.amazon.in/s?k=recycled+paper+notebook+a5+india",
    platform: "Amazon.in"
  },
  {
    id: "p027", name: "Plantable Seed Pencils (Pack of 10)", brand: "Sprout",
    category: "Stationery", price: 299, currency: "₹", ecoScore: 10,
    image: "✏️", certifications: ["Plantable", "Non-toxic"],
    description: "Pencils with seed capsule at the end. Plant when done — grows into herbs or flowers!",
    carbonKg: 0.1, tags: ["zero-waste", "plantable", "biodegradable"],
    buyLink: "https://www.amazon.in/s?k=plantable+seed+pencils+india",
    platform: "Amazon.in"
  },

  // ── Food & Beverage ────────────────────────────────────────
  {
    id: "p028", name: "Organic Green Tea (100g)", brand: "Organic India",
    category: "Food & Beverage", price: 299, currency: "₹", ecoScore: 8,
    image: "🍵", certifications: ["USDA Organic", "India Organic", "Fair Trade"],
    description: "Certified organic green tea grown in India. Biodegradable tea bags, recycled packaging.",
    carbonKg: 0.5, tags: ["organic", "fair-trade", "natural"],
    buyLink: "https://www.amazon.in/s?k=organic+india+green+tea",
    platform: "Amazon.in"
  },
  {
    id: "p029", name: "Cold Pressed Mustard Oil (1L)", brand: "Farm Naturelle",
    category: "Food & Beverage", price: 349, currency: "₹", ecoScore: 8,
    image: "🫙", certifications: ["Cold Pressed", "No Preservatives"],
    description: "Traditional kachi ghani mustard oil. No chemicals, supports Indian farmers.",
    carbonKg: 1.0, tags: ["natural", "traditional", "organic"],
    buyLink: "https://www.amazon.in/s?k=farm+naturelle+cold+pressed+mustard+oil",
    platform: "Amazon.in"
  },

  // ── Kids ───────────────────────────────────────────────────
  {
    id: "p030", name: "Wooden Building Blocks (50-piece)", brand: "Skillofun",
    category: "Kids", price: 699, currency: "₹", ecoScore: 9,
    image: "🧱", certifications: ["Non-toxic Paint", "Natural Wood"],
    description: "Natural wood building blocks. No plastic, non-toxic paint, develops creativity.",
    carbonKg: 1.5, tags: ["natural", "plastic-free", "educational"],
    buyLink: "https://www.amazon.in/s?k=wooden+building+blocks+kids+india",
    platform: "Amazon.in"
  },
];

// GET /api/products
router.get("/", (req, res) => {
  const { category, minEcoScore, search, tags } = req.query;
  let results = [...PRODUCTS];

  if (category) results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (minEcoScore) results = results.filter(p => p.ecoScore >= parseInt(minEcoScore));
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.includes(q))
    );
  }
  if (tags) {
    const tagList = tags.split(",").map(t => t.trim().toLowerCase());
    results = results.filter(p => tagList.some(tag => p.tags.includes(tag)));
  }

  res.json({ total: results.length, products: results });
});

router.get("/categories/list", (req, res) => {
  const categories = [...new Set(PRODUCTS.map(p => p.category))];
  res.json({ categories });
});

router.get("/:id", (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.post("/alternatives", async (req, res) => {
  try {
    const { category, budget = "medium" } = req.body;
    if (!category) return res.status(400).json({ error: "category is required" });
    const alternatives = await getEcoAlternatives(category, budget);
    res.json(alternatives);
  } catch (err) {
    res.status(500).json({ error: "Failed to get alternatives." });
  }
});

module.exports = router;
