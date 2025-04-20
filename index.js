import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";

const app = express();
const port = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/analyze", async (req, res) => {
  const { videoUrl, type } = req.body;

  let prompt;
  switch (type) {
    case "magic":
      prompt = `Please summarize the content of this YouTube page in under 300 words. Here is the link: ${videoUrl}`;
      break;
    case "review":
      prompt = `Analyze this YouTube video and provide the final product the reviewer recommends, along with 2–3 concise reasons. Video: ${videoUrl}`;
      break;
    case "ask":
      prompt = `Here is the video link: ${videoUrl}\n\n(Ask your question below)`;
      break;
    default:
      return res.status(400).json({ error: "Invalid type" });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const answer = completion.data.choices[0].message.content;
    res.json({ result: answer });
  } catch (err) {
    console.error("[Smart-Rec Error]", err.message || err);
    res.status(500).json({ error: "Failed to generate recommendation" });
  }
});

app.get("/", (req, res) => {
  res.send("Smart-Rec backend is running.");
});

app.listen(port, () => {
  console.log(`✅ Smart-Rec backend running on port ${port}`);
});
