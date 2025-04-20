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
  const { url = "", title = "" } = req.body;

  try {
    const prompt = `
You are an expert product review summarizer.

A YouTube video titled: "${title}" located at ${url} is a product review or comparison video.

Your job is to identify the **final product recommendation** made by the reviewer — the product they clearly suggest viewers buy.

Return your answer in this format:

**Product Name**: [name of the product]
**Why it’s recommended**: [concise summary of key benefits mentioned by the reviewer]

If the video does not contain a clear recommendation, respond with:
⚠️ No clear recommendation found.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const recommendation = response.choices[0].message.content.trim();
    return res.json({ recommendation });

  } catch (error) {
    console.error("Smart-Rec v3.0 GPT error:", error?.response?.data || error.message);
    return res.status(200).json({
      recommendation: "⚠️ Error: Could not get a recommendation."
    });
  }
});

app.listen(PORT, () => {
  console.log("✅ Smart-Rec v3.0 backend is live on port " + PORT);
});
