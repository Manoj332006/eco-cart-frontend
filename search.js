const express = require("express");
const router = express.Router();
const https = require("https");
const { analyzeProduct } = require("./aiService");

/**
 * Fetch real products from RapidAPI Amazon India
 * Falls back to curated results if API unavailable
 */
function fetchAmazonProducts(query) {
  return new Promise((resolve) => {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) return resolve(null);

    const options = {
      hostname: "real-time-amazon-data.p.rapidapi.com",
      path: `/search?query=${encodeURIComponent(query + " eco friendly")}&page=1&country=IN&category_id=aps`,
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const products = (parsed.data?.products || []).slice(0, 8).map(p => ({
            id: p.asin,
            name: p.product_title,
            brand: p.product_brand || "Unknown",
            price: p.product_price || "N/A",
            originalPrice: p.product_original_price,
            rating: p.product_star_rating,
            reviews: p.product_num_ratings,
            image: p.product_photo,
            buyLink: p.product_url || `https://www.amazon.in/dp/${p.asin}`,
            platform: "Amazon.in",
            source: "amazon",
          }));
          resolve(products.length ? products : null);
        } catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.end();
  });
}

/**
 * GET /api/search?q=bamboo+toothbrush
 * Returns real products from Amazon India
 */
router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });

  try {
    const products = await fetchAmazonProducts(q);
    if (products) {
      return res.json({ source: "amazon", products, query: q });
    }
    // No API key — return helpful message
    res.json({
      source: "none",
      products: [],
      query: q,
      searchLinks: {
        amazon: `https://www.amazon.in/s?k=${encodeURIComponent(q + " eco friendly")}`,
        flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(q + " eco friendly")}`,
        meesho: `https://www.meesho.com/search?q=${encodeURIComponent(q + " eco")}`,
        nykaa: `https://www.nykaa.com/search/result/?q=${encodeURIComponent(q)}`,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/search/analyze
 * AI analyze a product from search results
 */
router.post("/analyze", async (req, res) => {
  try {
    const { name, brand, category, description } = req.body;
    if (!name) return res.status(400).json({ error: "Product name required" });

    const analysis = await analyzeProduct({ name, brand, category, description });
    const gradeColors = {
      "A+": "#00c853", A: "#43a047", B: "#8bc34a",
      C: "#ffc107", D: "#ff7043", F: "#f44336",
    };
    res.json({ ...analysis, gradeColor: gradeColors[analysis.grade] || "#888" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
