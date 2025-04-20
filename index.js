import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/analyze', async (req, res) => {
  const { url = "", title = "", transcript = "" } = req.body;

  try {
    const prompt = `
You are a professional product analyst. A reviewer just published a YouTube video titled: "${title}" located at ${url}.

Here is the transcript of the video:
------------------
${transcript}
------------------

Based ONLY on this transcript, extract the final product recommendation made by the reviewer. Include:
- The exact product name
- 2–3 key features praised
- A short summary of why the reviewer recommends it

DO NOT guess or invent a product. If the recommendation is unclear, say: "⚠️ No clear recommendation found."
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const recommendation = response.choices[0].message.content.trim();
    return res.json({ recommendation });

  } catch (error) {
    console.error("Smart-Rec GPT-4 backend error:", error?.response?.data || error.message);
    const fallbackMessage = (error?.response?.data?.error?.message || "Something went wrong.");
    return res.status(200).json({
      recommendation: `⚠️ Smart-Rec GPT-4 failed: ${fallbackMessage}`
    });
  }
});

app.listen(PORT, () => {
  console.log("✅ Smart-Rec GPT-4 backend is live on port " + PORT);
});
