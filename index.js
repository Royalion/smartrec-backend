import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { OpenAI } from "openai";

const app = express();
app.use(express.json());

// ✅ CORS config: allow Chrome Extension + localhost
app.use(
  cors({
    origin: [
      "chrome-extension://<YOUR_EXTENSION_ID>", // ← REPLACE THIS with your actual extension ID
      "http://localhost:3000"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

// ✅ Main endpoint to analyze a YouTube review link
app.post("/analyze", async (req, res) => {
  const { url, prompt } = req.body;

  // Error if something's missing
  if (!url || !prompt) {
    return res.status(400).json({
      error: "Missing 'url' or 'prompt' in request body",
    });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nHere is the link: ${url}`,
        },
      ],
    });

    const result = completion.choices[0]?.message?.content || "No result.";
    res.json({ result });
  } catch (err) {
    console.error("[Smart-Rec Error]", err);
    res.status(500).json({
      error: "Failed to process the request",
      message: err?.message || "Unknown error",
    });
  }
});

// ✅ Server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`✅ Smart-Rec backend is live on port ${PORT}`)
);
