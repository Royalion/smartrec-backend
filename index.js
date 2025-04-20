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
  const videoUrl = req.body.url || "";
  const videoTitle = req.body.title || "";

  try {
    const prompt = `The following is a YouTube review video titled: "${videoTitle}". The video is located at: ${videoUrl}. Based on this, extract a clear, concise, and direct product recommendation including product name, key features praised, and why the reviewer recommends it.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const recommendation = response.choices[0].message.content.trim();

    return res.json({ recommendation });
  } catch (error) {
    console.error("Smart-Rec backend error:", error?.response?.data || error.message);
    const fallbackMessage = (error?.response?.data?.error?.message || "Something went wrong.");
    return res.status(200).json({
      recommendation: `⚠️ Smart-Rec is temporarily overloaded or encountered an issue: ${fallbackMessage}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Smart-Rec backend v2.1.5 is live on port ${PORT}`);
});
