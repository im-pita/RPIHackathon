// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/translate", async (req, res) => {
  try {
    const { text } = req.body;

    // Replace this with the actual Gemini endpoint and body structure
    const response = await fetch("https://api.gemini.com/v1/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        text,
        targetStyle: "2000s-2010s slang"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data); // assume { translatedText: "..." }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
