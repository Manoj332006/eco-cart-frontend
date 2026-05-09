const https = require("https");

const ECO_SYSTEM_PROMPT = `You are GreenGuide, an expert AI shopping assistant specializing in eco-friendly, sustainable, and ethical consumer products. Your mission is to help users make environmentally conscious purchasing decisions.

Your capabilities:
1. Eco Score Analysis - Rate products 1-10 on environmental impact.
2. Sustainable Alternatives - Suggest greener alternatives.
3. Impact Insights - Translate purchases into real-world environmental metrics.
4. Shopping Guidance - Help users find certified products.
5. Lifestyle Tips - Offer practical eco-friendly living advice.

Response style:
- Be warm, encouraging, and non-judgmental.
- Use emojis sparingly.
- Always include an Eco Score (1-10) when analyzing products.
- Keep responses concise but informative.`;

function callAI(messages) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return reject(new Error("No API key found. Set OPENROUTER_API_KEY in Render environment variables."));
    }

    const isGroq = apiKey.startsWith("gsk_");

    const hostname = isGroq ? "api.groq.com" : "openrouter.ai";
    const path = isGroq ? "/openai/v1/chat/completions" : "/api/v1/chat/completions";
    const model = isGroq ? "llama3-8b-8192" : "google/gemma-3-4b-it:free";

    const body = JSON.stringify({
      model,
      max_tokens: 1024,
      messages,
    });

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "Content-Length": Buffer.byteLength(body),
    };

    if (!isGroq) {
      headers["HTTP-Referer"] = "https://greenguide.app";
      headers["X-Title"] = "GreenGuide Eco Shopping";
    }

    const req = https.request({ hostname, path, method: "POST", headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error("AI error: " + JSON.stringify(parsed.error)));
          const content = parsed.choices?.[0]?.message?.content;
          if (!content) return reject(new Error("Empty response: " + data.substring(0, 200)));
          resolve(content);
        } catch (e) {
          reject(new Error("Parse error: " + data.substring(0, 200)));
        }
      });
    });

    req.on("error", (e) => reject(new Error("Network error: " + e.message)));
    req.write(body);
    req.end();
  });
}

async function chatWithEcoAssistant(messages) {
  return await callAI([{ role: "system", content: ECO_SYSTEM_PROMPT }, ...messages]);
}

async function analyzeProduct(product) {
  const prompt = `Analyze this product for environmental impact. Return ONLY valid JSON, no markdown, no backticks.

Format: {"ecoScore":7,"grade":"B","summary":"Summary.","factors":{"carbonFootprint":6,"recyclability":8,"materials":7,"packaging":8,"durability":9,"ethicalProduction":6},"positives":["Point 1"],"concerns":["Concern 1"],"alternatives":[{"name":"Alt","reason":"Why"}],"certifications":["Cert"],"carbonKg":3.5,"tip":"Tip."}

Product: ${product.name}
Brand: ${product.brand || "Unknown"}
Category: ${product.category || "General"}
Description: ${product.description || "None"}

ONLY return the JSON object.`;

  const text = await callAI([{ role: "user", content: prompt }]);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  try { return JSON.parse(match[0]); }
  catch (e) { return JSON.parse(match[0].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")); }
}

async function getEcoAlternatives(category, budget = "medium") {
  const prompt = `List 3 eco-friendly alternatives for "${category}" with ${budget} budget. ONLY return valid JSON:
{"category":"${category}","alternatives":[{"name":"Product","brand":"Brand","ecoScore":8,"priceRange":"$10-20","whyEco":"Reason","certifications":["Cert"],"buyingTip":"Tip"}],"generalTip":"Tip."}`;

  const text = await callAI([{ role: "user", content: prompt }]);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON");
  try { return JSON.parse(match[0]); }
  catch (e) { return JSON.parse(match[0].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")); }
}

module.exports = { chatWithEcoAssistant, analyzeProduct, getEcoAlternatives };
