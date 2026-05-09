const https = require("https");

const ECO_SYSTEM_PROMPT = `You are GreenGuide, an expert AI shopping assistant specializing in eco-friendly, sustainable, and ethical consumer products. Help users make environmentally conscious purchasing decisions. Be warm, encouraging, and non-judgmental. Use emojis sparingly. Always include an Eco Score (1-10) when analyzing products.`;

function callGroq(messages) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return reject(new Error("GROQ_API_KEY not set in environment variables"));

    const body = JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages,
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
          if (parsed.error) return reject(new Error("Groq error: " + JSON.stringify(parsed.error)));
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
  return await callGroq([
    { role: "system", content: ECO_SYSTEM_PROMPT },
    ...messages,
  ]);
}

async function analyzeProduct(product) {
  const prompt = `Analyze this product for environmental impact. Return ONLY valid JSON, no markdown, no backticks, no extra text.

Format exactly like this:
{"ecoScore":7,"grade":"B","summary":"Summary here.","factors":{"carbonFootprint":6,"recyclability":8,"materials":7,"packaging":8,"durability":9,"ethicalProduction":6},"positives":["Point 1","Point 2"],"concerns":["Concern 1"],"alternatives":[{"name":"Alternative","reason":"Why better"}],"certifications":["Cert"],"carbonKg":3.5,"tip":"Tip here."}

Product: ${product.name}
Brand: ${product.brand || "Unknown"}
Category: ${product.category || "General"}
Description: ${product.description || "None"}

Return ONLY the JSON.`;

  const text = await callGroq([{ role: "user", content: prompt }]);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  try {
    return JSON.parse(match[0]);
  } catch (e) {
    const clean = match[0].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
    return JSON.parse(clean);
  }
}

async function getEcoAlternatives(category, budget = "medium") {
  const prompt = `List 3 eco-friendly alternatives for "${category}" with ${budget} budget. Return ONLY valid JSON:
{"category":"${category}","alternatives":[{"name":"Product","brand":"Brand","ecoScore":8,"priceRange":"$10-20","whyEco":"Reason","certifications":["Cert"],"buyingTip":"Tip"}],"generalTip":"Tip."}`;

  const text = await callGroq([{ role: "user", content: prompt }]);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON");
  try {
    return JSON.parse(match[0]);
  } catch (e) {
    return JSON.parse(match[0].replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"));
  }
}

module.exports = { chatWithEcoAssistant, analyzeProduct, getEcoAlternatives };
