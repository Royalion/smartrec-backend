import express from "express";
import cors from "cors";
import { OpenAI } from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", async (req, res) => {
  const { videoUrl, mode } = req.body;

  if (!videoUrl || !mode) {
    return res.status(400).json({ error: "Missing videoUrl or mode." });
  }

  let prompt = "";

  switch (mode) {
    case "magic":
      prompt = `Please summarize the content of this YouTube page in under 300 words. Here is the link: ${videoUrl}`;
      break;
    case "ask":
      prompt = `This is the YouTube video being watched: ${videoUrl}. You can now ask your question.`;
      break;
    case "review":
      prompt = `Can you take a look at this YouTube video and just give me the final best recommended product and connect it to an Amazon link: ${videoUrl}`;
      break;
    default:
      return res.status(400).json({ error: "Invalid mode." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = completion.choices[0]?.message?.content || "No clear recommendation found.";
    res.json({ result });
  } catch (err) {
    console.error("[Smart-Rec Error]", err);
    res.status(500).json({ error: "Failed to analyze video." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Smart-Rec backend is live on port ${PORT}`);
});
