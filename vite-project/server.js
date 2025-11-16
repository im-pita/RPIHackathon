// Install: npm install express dotenv node-fetch
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json()); 
// Allow frontend to access the server (assuming React is on a different port like 5173/3000)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// --- ElevenLabs Text-to-Speech API Route ---
app.post('/api/tts', async (req, res) => {
    const textToSpeak = req.body.textToSpeak;
    const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY; // Use your actual env key name
    const EL_VOICE_ID = "21m00Tcm4wMe8RLQysT5"; // Rachel's voice ID (common)

    if (!textToSpeak) {
        return res.status(400).send("Missing text to speak.");
    }

    try {
        const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY, // The API key is securely used here
            },
            body: JSON.stringify({
                text: textToSpeak,
                model_id: "eleven_multilingual_v2", 
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
        });

        if (!elevenLabsResponse.ok) {
            const errorBody = await elevenLabsResponse.json();
            console.error("ElevenLabs Error:", errorBody);
            return res.status(elevenLabsResponse.status).send(`ElevenLabs TTS failed: ${errorBody.detail.message || 'Unknown Error'}`);
        }

        // Set headers to stream the MP3 audio data directly back to the React app
        res.setHeader('Content-Type', 'audio/mpeg');
        
        // Pipe the audio stream from ElevenLabs directly to the client
        elevenLabsResponse.body.pipe(res);

    } catch (error) {
        console.error("Server error during TTS:", error);
        res.status(500).send("Internal server error during TTS process.");
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Make sure your React app calls http://localhost:${PORT}/api/tts`);
});