const https = require("https");

const ECO_SYSTEM_PROMPT = `You are GreenGuide, an expert AI shopping assistant specializing in eco-friendly, sustainable, and ethical consumer products. Your mission is to help users make environmentally conscious purchasing decisions.

Your capabilities:
1. **Eco Score Analysis** – Rate products 1–10 on environmental impact using: carbon footprint, recyclability, materials origin, production ethics, packaging, and longevity.
2. **Sustainable Alternatives** – Suggest greener alternatives to conventional products.
3. **Impact Insights** – Translate purchases into real-world environmental metrics (CO2 saved, water conserved, plastic avoided).
4. **Shopping Guidance** – Help users find certified products (Fair Trade, B Corp, Rainforest Alliance, USDA Organic, etc.)
5. **Lifestyle Tips** – Offer practical eco-friendly living advice.

Response style:
- Be warm, encouraging, and non-judgmental. Every step toward sustainability matters.
- Use emojis sparingly to add personality.
- Always include an Eco Score (1-10) when analyzing products.
- Keep responses concise but informative.`;

/**
 * Call Groq API using raw HTTPS (no SDK needed)
 */
function callGroq(messages, systemPrompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return reject(new Error("GROQ_API_KEY environment variable is not set"));
    }

    const allMessages = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    const body = JSON.stringify({
      model: "llama3-8b-8192",
      max_tokens: 1024,
      messages: allMessages,
    });

    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(`Groq API error: ${parsed.error.message}`));
          }
          const content = parsed.choices?.[0]?.message?.content;
          if (!content) {
            return reject(new Error("No content in Groq response: " + data));
          }
          resolve(content);
        } catch (e) {
          reject(new Error("Failed to parse Groq response: " + data));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Chat with GreenGuide AI
 */
async function chatWithEcoAssistant(messages) {
  return await callGroq(messages, ECO_SYSTEM_PROMPT);
}

/**
 * Analyze a product's eco-friendliness
 */
async function analyzeProduct(product) {
  const prompt = `Analyze this product for environmental impact and return ONLY a valid JSON object with no markdown, no backticks, no extra text before or after:
{
  "ecoScore": 7,
  "grade": "B",
  "summary": "Brief 1-2 sentence summary here.",
  "factors": {
    "carbonFootprint": 6,
    "recyclability": 8,
    "materials": 7,
    "packaging": 8,
    "durability": 9,
    "ethicalProduction": 6
  },
  "positives": ["Positive point 1", "Positive point 2"],
  "concerns": ["Concern 1", "Concern 2"],
  "alternatives": [{"name": "Alternative product", "reason": "Why it is better"}],
  "certifications": ["Certification name"],
  "carbonKg": 3.5,
  "tip": "Actionable tip for the user."
}

Analyze this product and return JSON in exactly that format:
Product: ${product.name}
Brand: ${product.brand || "Unknown"}
Category: ${product.category || "General"}
Description: ${product.description || "No description provided"}

IMPORTANT: Return ONLY the JSON object. No other text.`;

  const text = await callGroq([{ role: "user", content: prompt }]);

  // Try to extract JSON even if model adds extra text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response: " + text.substring(0, 200));
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    // Clean and retry
    const clean = jsonMatch[0]
      .replace(/[\x00-\x1F\x7F]/g, " ")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    return JSON.parse(clean);
  }
}

/**
 * Get eco-friendly alternatives for a product category
 */
async function getEcoAlternatives(category, budget = "medium") {
  const prompt = `List 3 eco-friendly product alternatives for the category "${category}" with ${budget} budget.
Return ONLY a valid JSON object, no markdown, no backticks:
{
  "category": "${category}",
  "alternatives": [
    {
      "name": "Product name",
      "brand": "Brand name",
      "ecoScore": 8,
      "priceRange": "$10-20",
      "whyEco": "Why this is eco-friendly",
      "certifications": ["Certification"],
      "buyingTip": "Tip for buying"
    }
  ],
  "generalTip": "General tip for this category."
}

IMPORTANT: Return ONLY the JSON object. No other text.`;

  const text = await callGroq([{ role: "user", content: prompt }]);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in alternatives response");

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    const clean = jsonMatch[0].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
    return JSON.parse(clean);
  }
}

module.exports = { chatWithEcoAssistant, analyzeProduct, getEcoAlternatives };
