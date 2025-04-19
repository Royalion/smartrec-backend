
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Smart-Rec backend is running (CORS-enabled).");
});

app.post("/analyze", async (req, res) => {
  const { videoId, transcript } = req.body;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return res.status(500).send("Missing OpenAI API key");

  const prompt = `From this YouTube review transcript, what product does the reviewer most clearly recommend? Format: \n\nProduct: <name>\n\n• Bullet 1\n• Bullet 2\n• Bullet 3\n\nTranscript:\n${transcript}`;

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      }
    });

    const content = response.data.choices[0].message.content || "";
    res.json({ result: content });
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

app.listen(port, () => {
  console.log(`Smart-Rec backend running on port ${port}`);
});
