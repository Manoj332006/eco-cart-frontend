const express = require("express");
const router = express.Router();
const { chatWithEcoAssistant } = require("../aiService");

/**
 * POST /api/assistant/chat
 * Body: { messages: [{role, content}], userMessage: string }
 * Returns: { reply: string, timestamp: string }
 */
router.post("/chat", async (req, res) => {
  try {
    const { messages = [], userMessage } = req.body;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "userMessage is required and must be a string." });
    }

    if (userMessage.trim().length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)." });
    }

    // Build conversation history
    const conversationHistory = [
      ...messages.slice(-10), // Keep last 10 messages for context
      { role: "user", content: userMessage.trim() },
    ];

    const reply = await chatWithEcoAssistant(conversationHistory);

    res.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Failed to get AI response. Please try again." });
  }
});

/**
 * POST /api/assistant/quick-tips
 * Body: { topic: string }
 * Returns: { tips: string }
 */
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
    console.error("Quick tips error:", err);
    res.status(500).json({ error: "Failed to generate tips." });
  }
});

module.exports = router;
