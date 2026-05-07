const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ECO_SYSTEM_PROMPT = `You are GreenGuide, an expert AI shopping assistant specializing in eco-friendly, sustainable, and ethical consumer products. Your mission is to help users make environmentally conscious purchasing decisions.

Your capabilities:
1. **Eco Score Analysis** – Rate products 1–10 on environmental impact using: carbon footprint, recyclability, materials origin, production ethics, packaging, and longevity.
2. **Sustainable Alternatives** – Suggest greener alternatives to conventional products.
3. **Impact Insights** – Translate purchases into real-world environmental metrics (CO₂ saved, water conserved, plastic avoided).
4. **Shopping Guidance** – Help users find certified products (Fair Trade, B Corp, Rainforest Alliance, USDA Organic, etc.)
5. **Lifestyle Tips** – Offer practical eco-friendly living advice.

Response style:
- Be warm, encouraging, and non-judgmental. Every step toward sustainability matters.
- Use emojis sparingly to add personality (🌱 🌍 ♻️).
- Always include an "Eco Score" (1–10) and a brief "Why it matters" when analyzing products.
- Keep responses concise but informative.
- When suggesting alternatives, explain WHY they're better.

Format eco analysis as:
**Eco Score: X/10** [emoji representing score]
**Key factors:** [bullet list]
**Better alternatives:** [if applicable]
**Impact:** [real-world equivalent]`;

/**
 * Chat with GreenGuide AI
 * @param {Array} messages - conversation history [{role, content}]
 * @returns {Promise<string>} AI response text
 */
async function chatWithEcoAssistant(messages) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: ECO_SYSTEM_PROMPT,
    messages,
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/**
 * Analyze a product's eco-friendliness
 * @param {Object} product - { name, brand, category, description }
 * @returns {Promise<Object>} structured analysis
 */
async function analyzeProduct(product) {
  const prompt = `Analyze this product for environmental impact and return a JSON object (no markdown, no backticks):
{
  "ecoScore": <number 1-10>,
  "grade": <"A+"|"A"|"B"|"C"|"D"|"F">,
  "summary": <string, 1-2 sentences>,
  "factors": {
    "carbonFootprint": <number 1-10>,
    "recyclability": <number 1-10>,
    "materials": <number 1-10>,
    "packaging": <number 1-10>,
    "durability": <number 1-10>,
    "ethicalProduction": <number 1-10>
  },
  "positives": [<string>],
  "concerns": [<string>],
  "alternatives": [{"name": <string>, "reason": <string>}],
  "certifications": [<string>],
  "carbonKg": <estimated kg CO2 for lifecycle, number>,
  "tip": <string, actionable tip>
}

Product: ${product.name}
Brand: ${product.brand || "Unknown"}
Category: ${product.category || "General"}
Description: ${product.description || "No description provided"}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

/**
 * Get eco-friendly alternatives for a product category
 * @param {string} category - product category
 * @param {string} budget - "low"|"medium"|"high"
 * @returns {Promise<Object>}
 */
async function getEcoAlternatives(category, budget = "medium") {
  const prompt = `List 5 eco-friendly product alternatives for the category "${category}" with ${budget} budget. Return JSON only (no markdown):
{
  "category": "${category}",
  "alternatives": [
    {
      "name": <string>,
      "brand": <string>,
      "ecoScore": <1-10>,
      "priceRange": <string>,
      "whyEco": <string>,
      "certifications": [<string>],
      "buyingTip": <string>
    }
  ],
  "generalTip": <string>
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

module.exports = { chatWithEcoAssistant, analyzeProduct, getEcoAlternatives };
