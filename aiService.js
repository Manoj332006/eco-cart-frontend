cconst Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getAIResponse(messages, systemPrompt) {
  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: systemPrompt || "You are GreenGuide, an AI-powered eco shopping assistant." },
      ...messages
    ],
    max_tokens: 1024,
  });
  return response.choices[0].message.content;
}

module.exports = { getAIResponse };

