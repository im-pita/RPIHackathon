
import './App.css';

import React, { useState } from "react";

function App() {
  const [userInput, setUserInput] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice input function with Slang Grammar Biasing
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // --- Slang Grammar Biasing (Best-effort fix for 'rizz', 'low-key', etc.) ---
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const slangGrammar = `#JSGF V1.0; grammar slang; public <slang> = low key | rizz | no cap | bussin | slay | mid;`;

    if (SpeechGrammarList) {
        const grammarList = new SpeechGrammarList();
        grammarList.addFromString(slangGrammar, 10); // High weight to slang terms
        recognition.grammars = grammarList;
    }
    // -------------------------------------------------------------------------

    recognition.start();

    recognition.onstart = () => {
        setTranslatedText("Listening... speak now.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setTranslatedText("Transcript ready. Click Translate to interpret the slang.");
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setTranslatedText(`Speech recognition error: ${event.error}`);
    };
  };

  // --- Gemini API Call (Client-Side, Insecure but Functional for Hackathon) ---
  const translateWithGemini = async (text) => {
    // ⚠️ INSECURE FOR PRODUCTION - For Hackathon use only
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Correct Endpoint and Authentication
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // --- Start of Smart Prompt for Correction, Tone, and Formatting ---
    const prompt = `
      You're taking as an input Gen Z/Gen Alpha slang and interpreting it to output the phrase for someone familiar with 2000s-2005s slang. Your task is to process the transcribed text from a speech-to-text system.
      
      **Rule A: Negative Constraint:** Do NOT include any introductory commentary, analysis, greetings (e.g., "Yo, check it," "First up,"), or explanatory sentences regarding the slang correction. The output must start directly with the Primary Translation sentence.

      **Step 1: STT Error Correction:** If you see any of the following misspellings, correct them if they don't make sense in the context before proceeding:
      - 'Loki' or 'Low key' -> 'low-key' (means on-the-down-low)
      - 'ris', 'risks', 'lease', 'raise', 'rizz','riz' -> 'rizz' (means charisma)
      - 'busting', 'basin', 'bussin' -> 'bussin'
      - 'yatch', 'god', 'giant', 'gyatt' -> 'gyatt' (means buttocks)
      - 'stigma', 'sigma' -> 'sigma'
      - 'on', 'own', 'unc', 'uncle' -> 'unc' (means old person)
      

      **Step 2: If parts of the input text don't make sense in the context of the sentence, don't try to explain it, just output the strict format that is mentioned in the example below.

      **Step 3: Primary Translation:** Provide the most fitting translation of the entire sentence based on the corrected slang.
      
      **Step 4: Output Formatting:** Provide the Primary Translation, followed by exactly three alternative translations separated by dashes, under the heading "Additionally it could mean: ...".

      **Step 5: Output must be concise and strictly conform to the format of the example. It should fill in the additioinal spaces in the format of the example.

      Step 6: If the input is one word that doesn't have a significant explanation, then output It is what it is, just something the kids say (no meaning). In this case, do not include the additional suggestions.

      User Text to Translate: "${text}"

      ** Output Format Must Strictly conform to this Example:**
      
      
      Additionally it could mean: 
      - 
      - 
      - 
    `;
    // --- End of Smart Prompt ---

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Gemini API Error Body:", errorBody);
        throw new Error(`Gemini API request failed: ${response.status} - ${errorBody.error.message || 'Unknown Error'}`);
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Translation not found in API response.";
    
    return translatedText.trim();
  };
  // -------------------------------------------------------------

  const handleTranslate = async () => {
    if (!userInput.trim()) {
      setTranslatedText("Please enter or speak some slang first.");
      return;
    }
    setLoading(true);
    setTranslatedText("");
    try {
      const translated = await translateWithGemini(userInput);
      setTranslatedText(translated);
    } catch (err) {
      console.error("Translation error:", err);
      setTranslatedText(`Error translating text: ${err.message}. Check the console for details.`);
    }
    setLoading(false);
  };

return (
    <div className="app-container">
      <h1 className="app-title">What is my kid saying? 🤔 </h1>
      <textarea className="input-area"
        rows="4"
        cols="50"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type or speak your Gen Z slang here (e.g., 'Low-key, that song is bussin')."
        disabled={loading}
      />
      <br /><br />
      <button className="app-button" onClick={handleTranslate} disabled={loading}>
        {loading ? "Translating..." : "Translate"}
      </button>
      <button className="app-button" style={{ marginLeft: 10 }} onClick={startListening} disabled={loading} >
         Speak
      </button>

      {translatedText && (
        <div className="output-container">
          <p className="translated-text-p">Translated Text:</p>
          <div className="translated-content">
            {translatedText}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

/*
import React, { useState } from "react";

function App() {
  const [userInput, setUserInput] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  // --- API Key Constants (INSECURE! Use for Hackathon only) ---
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const EL_VOICE_ID = "21m00Tcm4wMe8RLQysT5"; // Default ElevenLabs voice
  // -----------------------------------------------------------

  // Voice input (Grammar Biasing included, remains the same)
  const startListening = () => {
    // ... (Your existing startListening function goes here, including Grammars) ...
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const slangGrammar = `#JSGF V1.0; grammar slang; public <slang> = low key | rizz | no cap | bussin | slay | mid | gyatt | gyat;`;

    if (SpeechGrammarList) {
        const grammarList = new SpeechGrammarList();
        grammarList.addFromString(slangGrammar, 10);
        recognition.grammars = grammarList;
    }

    recognition.start();
    recognition.onstart = () => { setTranslatedText("Listening... speak now."); };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setTranslatedText("Transcript ready. Click Translate to interpret the slang.");
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setTranslatedText(`Speech recognition error: ${event.error}`);
    };
  };


  const playAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  // --- 🚨 FINAL COMBINED CLIENT-SIDE API LOGIC ---
  const translateAndSpeak = async (text) => {
    setLoading(true);
    setTranslatedText("");
    setAudioURL(null);

    try {
      // 1. CALL GEMINI API (Translation)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const prompt = `
        You are a Gen Z slang interpreter. Your task is to process the transcribed text from a speech-to-text system.
        **Step 1: STT Error Correction:** If you see any of the following misspellings, correct them: 'Loki'->'low-key', 'ris'->'rizz', 'yacht'->'gyatt'.
        **Step 2: Slang Equivalents (Intensity Control):** Interpret 'bussin'' to mean 'pretty good' or 'enjoyable,' not 'excellent.'
        **Step 3: Output Formatting:** Provide the primary translation, followed by exactly three alternative translations separated by dashes, under the heading "Additionally it could mean: ...".
        User Text to Translate: "${text}"
        **Strict Output Format Example:** To be honest, that song is pretty good. Additionally it could mean: - Honestly, this music is quite enjoyable. - I subtly agree that this track is decent. - I kind of like this song; it is quite enjoyable.
      `;

      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini API Failed: ${geminiResponse.statusText}`);
      }
      
      const geminiData = await geminiResponse.json();
      const fullTranslatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Translation not found.";
      setTranslatedText(fullTranslatedText);

      // 2. CALL ELEVENLABS API (Text-to-Speech)
      const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}`;
      
      const elResponse = await fetch(elevenLabsUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // ⚠️ ElevenLabs uses a custom header for the API key
            'xi-api-key': ELEVENLABS_API_KEY, 
        },
        body: JSON.stringify({
            text: fullTranslatedText, // Send the full output string
            model_id: "eleven_monolingual_v1",
            voice_settings: { stability: 0.5, similarity_boost: 0.5 }
        })
      });

      if (!elResponse.ok) {
        throw new Error(`ElevenLabs API Failed: ${elResponse.statusText}`);
      }

      // 3. PROCESS AUDIO STREAM
      const audioBlob = await elResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);

    } catch (err) {
      console.error("Full translation process error:", err);
      // Display a general user-friendly error
      setTranslatedText(`Error: Failed to process translation or audio. Check console for API details.`); 
    } finally {
      setLoading(false);
    }
  };
  // -------------------------------------------------------------

  const handleTranslate = () => {
    if (!userInput.trim()) {
      setTranslatedText("Please enter or speak some slang first.");
      return;
    }
    translateAndSpeak(userInput);
  };

return (
    <div style={{ padding: 50, textAlign: "center" }}>
      <h1>💬 Slang Translator</h1>
      <textarea
        rows="4"
        cols="50"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type or speak your Gen Z slang here..."
        disabled={loading}
      />
      <br /><br />
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? "Processing..." : "Translate & Speak"}
      </button>
      <button onClick={startListening} style={{ marginLeft: 10 }} disabled={loading}>
         Speak
      </button>

      {translatedText && (
        <div style={{ marginTop: 20 }}>
          <p>Translated Text:</p>
          <div style={{ padding: 10, background: "#e6f1ff", borderRadius: 8, whiteSpace: 'pre-wrap' }}>
            {translatedText}
          </div>
          {audioURL && (
            <button 
                onClick={playAudio} 
                style={{ marginTop: 10, backgroundColor: 'purple', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px' }}
                disabled={loading}
            >
              🔊 Play Full Output
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
*/