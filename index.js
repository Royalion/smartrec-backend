// index.js (complete backend)
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the prompt templates
const prompts = {
  magic: (url) => `Please summarize the content of this YouTube page in under 300 words. Here is the link: ${url}`,
  ask:   (url) => `Use this YouTube link for reference: ${url}. Wait for the user to ask a question before proceeding.`,
  review: (url) => `Analyze the final product recommendation made by the YouTube reviewer in this video. Provide the product name and 1-3 key reasons they recommend it. Here is the video link: ${url}`,
};

app.post("/analyze", async (req, res) => {
  try {
    const { url, mode } = req.body;

    if (!url || !mode || !prompts[mode]) {
      return res.status(400).json({ error: "Missing or invalid parameters." });
    }

    const prompt = prompts[mode](url);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = completion.choices[0]?.message?.content || "No recommendation found.";
    res.json({ result });
  } catch (error) {
    console.error("[Smart-Rec Error]", error);
    res.status(500).json({ error: "Failed to analyze the page." });
  }
});

app.listen(port, () => {
  console.log(`\u2705 Smart-Rec backend is live on port ${port}`);
});
