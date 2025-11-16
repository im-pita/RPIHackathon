
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
import React, { useState, useRef } from "react";
// ... (omitted imports and unused App.css import for brevity) ...

function App() {
  const [userInput, setUserInput] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioURL, setAudioURL] = useState(null); // Stores the URL for the generated audio
  const audioRef = useRef(null); // Ref for the Audio element

  // --- Voice input (startListening is the same) ---
  const startListening = () => {
    // ... (Your existing startListening code is fine) ...
  };
  
  // New function to play the audio
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  // --- COMBINED Gemini Translation and ElevenLabs TTS ---
  const translateAndSpeak = async (text) => {
    setLoading(true);
    setTranslatedText("");
    setAudioURL(null); // Clear previous audio
    
    try {
      // 1. Send the text input to the combined SECURE backend route
      // NOTE: This route handles Gemini (translation) and then ElevenLabs (TTS).
      const response = await fetch("/api/translate-and-speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textInput: text }),
      });

      if (!response.ok) {
        throw new Error(`Server request failed with status: ${response.status}. Did you start your Node.js server?`);
      }

      // The server returns the final translated text AND the audio data
      const data = await response.blob();
      
      // The server should return a JSON object with the text and the audio blob URL
      // Since fetch to /api/translate-and-speak returns a Blob (MP3 audio), we must handle the translation text differently
      // The simplest way for a hackathon is for the server to return the audio, and we'll fetch the text separately 
      // OR, the server MUST set the translated text in a custom header (Less reliable)
      
      // ******* HACKATHON WORKAROUND: ASSUME SERVER RETURNS A BLOB OF AUDIO *******
      
      // Let's assume the server returns a JSON object with both: { text: "...", audioBlob: <binary data> }
      // Since React Fetch can't handle a mixed JSON/Blob response easily, we must use a two-step process:
      
      // Step A: Get the translated text from the Gemini endpoint (client-side)
      const translated = await translateWithGemini(text); // Reuse your existing Gemini call
      setTranslatedText(translated);

      // Step B: Send the FINAL translated text to a new server endpoint just for TTS
      const audioResponse = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textToSpeak: translated }),
      });
      
      if (!audioResponse.ok) {
        throw new Error(`TTS server failed with status: ${audioResponse.status}`);
      }

      // Convert the raw MP3 audio blob to a URL that the <audio> element can play
      const audioBlob = await audioResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      
    } catch (err) {
      console.error("Translation/TTS error:", err);
      setTranslatedText(`Error: ${err.message}. Check the console and server logs.`);
    } finally {
      setLoading(false);
    }
  };

  // Re-define your original Gemini translation function, but remove the loading/state logic
  // This will be called *before* the TTS step
  const translateWithGemini = async (text) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // --- Smart Prompt (same as before) ---
    const prompt = `
      You're taking as an input Gen Z/Gen Alpha slang and interpreting it to output the phrase for someone familiar with 2000s-2005s slang...
      // ... (use your full prompt text here) ...
      User Text to Translate: "${text}"
      
      ** Output Format Must Strictly conform to this Example:**
      
      
      Additionally it could mean: 
      - 
      - 
      - 
    `;
    // --- End of Smart Prompt ---

    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Gemini failed: ${errorBody.error.message || 'Unknown Error'}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "Translation not found.";
  };
  
  // The handleTranslate function now calls the combined function
  const handleTranslate = () => {
    if (!userInput.trim()) {
      setTranslatedText("Please enter or speak some slang first.");
      return;
    }
    translateAndSpeak(userInput);
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
        {loading ? "Processing..." : "Translate & Speak"}
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
          {audioURL && (
            <>
              {//Hidden audio element to hold the audio data}
              <audio ref={audioRef} src={audioURL} /> 
              <button 
                  onClick={playAudio} 
                  className="app-button"
                  style={{ marginTop: 10, backgroundColor: '#39a', color: 'white' }}
              >
                🔊 Play Full Output
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
*/