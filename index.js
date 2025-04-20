import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/analyze', async (req, res) => {
  const videoUrl = req.body.url || "";

  try {
    const prompt = `Extract a clear, concise product recommendation based on the review video at this URL: ${videoUrl}`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const recommendation = response.data.choices[0].message.content.trim();

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
  console.log(`Smart-Rec backend v2.1 running on port ${PORT}`);
});
