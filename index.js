const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// ─── CORS + Preflight ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
// Explicitly handle OPTIONS preflight for /analyze
app.options("/analyze", cors({ origin: "*" }));
// ──────────────────────────────────────────────────────────────────────────────

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Smart-Rec backend is running (CORS-enabled).");
});

app.post("/analyze", async (req, res) => {
  const { videoId, transcript } = req.body;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  // Build your prompt (fallback to videoId if no transcript passed)
  const prompt = `From this YouTube review transcript, what product does the reviewer most clearly recommend? 
Format: 
  
Product: <name>

• Bullet 1
• Bullet 2
• Bullet 3

Transcript:
${transcript || `(no transcript provided for videoId ${videoId})`}`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices?.[0]?.message?.content || "";
    // You can parse content into JSON here if you want structured output
    return res.json({ result: content });
  } catch (err) {
    // Log full error for debugging
    console.error("Analyze route error:", err.response?.data || err.message);
    // Return real error message (and optionally stack)
    return res.status(500).json({
      error: err.response?.data?.error?.message || err.message,
      stack: err.stack
    });
  }
});

app.listen(port, () => {
  console.log(`Smart-Rec backend running on port ${port}`);
});
