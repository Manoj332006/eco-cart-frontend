const express = require("express");
const router = express.Router();
const { chatWithEcoAssistant } = require("./aiService");

router.post("/chat", async (req, res) => {
  try {
    const { messages = [], userMessage } = req.body;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "userMessage is required." });
    }

    if (userMessage.trim().length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)." });
    }

    const conversationHistory = [
      ...messages.slice(-10),
      { role: "user", content: userMessage.trim() },
    ];

    const reply = await chatWithEcoAssistant(conversationHistory);

    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Failed to get AI response: " + err.message });
  }
});

router.post("/quick-tips", async (req, res) => {
  try {
    const { topic = "general eco-friendly shopping" } = req.body;

    const reply = await chatWithEcoAssistant([
      {
        role: "user",
        content: `Give me 5 quick, actionable eco-friendly shopping tips about: ${topic}. Format as a numbered list.`,
      },
    ]);

    res.json({ tips: reply, topic, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Quick tips error:", err.message);
    res.status(500).json({ error: "Failed to generate tips: " + err.message });
  }
});

module.exports = router;
