import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { OpenAI } from "openai";

const app = express();
app.use(express.json());

// ✅ Allow all Chrome Extensions and localhost (public-safe default)
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        origin?.startsWith("chrome-extension://") ||
        origin === "http://localhost:3000" ||
        !origin // some browser requests might be null
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed from this origin"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.post("/analyze", async (req, res) => {
  const { url, prompt } = req.body;

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`✅ Smart-Rec backend is live on port ${PORT}`)
);
