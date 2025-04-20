// index.js — Smart-Rec Backend v3.1 (ESM + OpenAI v4 compatible)

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ OpenAI v4-compatible default import
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔍 YouTube transcript fetcher
const YOUTUBE_TRANSCRIPT_API = 'https://yt.lemnoslife.com/videos?part=transcript&id=';

// 🧠 Prompt generator for all modes
function generatePrompt(transcript, mode, url) {
  const basePrompt = {
    'magic-summary': `Please summarize the content of this YouTube video in under 300 words. Here's the link: ${url}\n\nTranscript:\n${transcript}`,
    'review-summary': `From this video transcript, extract the final recommended product by the reviewer. Provide:\n- Product Name\n- 2-3 Key Features Praised\n- Why they recommend it\n- Link if available\n\nTranscript:\n${transcript}`,
    'ask-about-page': `Here is a YouTube video transcript. Please wait for the user to ask a question about this video.\n\nTranscript:\n${transcript}`,
  };
  return basePrompt[mode] || basePrompt['magic-summary'];
}

// 📼 Pull full transcript
async function getTranscript(videoId) {
  const response = await fetch(`${YOUTUBE_TRANSCRIPT_API}${videoId}`);
  const data = await response.json();
  const segments = data?.items?.[0]?.transcript?.segments || [];
  return segments.map(seg => seg.text).join(' ');
}

// 🧠 Analyze endpoint
app.post('/analyze', async (req, res) => {
  try {
    const { videoUrl, mode } = req.body;
    const videoId = new URL(videoUrl).searchParams.get('v');
    if (!videoId) return res.status(400).json({ error: 'Invalid video URL.' });

    const transcript = await getTranscript(videoId);
    if (!transcript) return res.status(404).json({ error: 'Transcript not found.' });

    const prompt = generatePrompt(transcript, mode, videoUrl);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    res.json({ result });
  } catch (err) {
    console.error('[Smart-Rec Error]', err);
    res.status(500).json({ error: 'Server error. See logs.' });
  }
});

// 🟢 Ping endpoint
app.get('/', (req, res) => {
  res.send('Smart-Rec backend v3.1 is live');
});

// 🚀 Launch
app.listen(PORT, () => {
  console.log(`✅ Smart-Rec backend v3.1 running on port ${PORT}`);
});
