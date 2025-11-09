import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import http from "http";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Initialize GoogleGenAI - it automatically picks up GEMINI_API_KEY from environment
const ai = new GoogleGenAI({});

// Initialize ElevenLabs client for TTS
console.log("🔍 TTS Debug: Checking ElevenLabs API key...");
const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
if (!elevenlabsApiKey) {
  console.error("❌ TTS Error: ELEVENLABS_API_KEY is not set in .env file");
} else if (elevenlabsApiKey.length < 20) {
  console.error("❌ TTS Error: ELEVENLABS_API_KEY appears to be invalid (too short)");
} else {
  console.log("✅ TTS Debug: API key found (length:", elevenlabsApiKey.length, "characters)");
  console.log("🔍 TTS Debug: API key starts with:", elevenlabsApiKey.substring(0, 7) + "...");
}

const elevenlabs = new ElevenLabsClient({
  apiKey: elevenlabsApiKey,
});

// Rachel's voice ID for Eden
const EDEN_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Function to generate speech from text
async function speakEdenResponse(text) {
  try {
    // Check if API key exists
    if (!elevenlabsApiKey) {
      console.error("❌ TTS Error: No API key available");
      throw new Error("ELEVENLABS_API_KEY not configured");
    }

    console.log("🔍 TTS Debug: Attempting to generate speech for text length:", text.length);
    console.log("🔍 TTS Debug: Using voice ID:", EDEN_VOICE_ID);
    console.log("🔍 TTS Debug: Using model: eleven_turbo_v2");

    const speech = await elevenlabs.textToSpeech.convert(EDEN_VOICE_ID, {
      text,
      model_id: "eleven_turbo_v2",
    });

    console.log("✅ TTS Debug: Speech stream received, converting to buffer...");

    // Convert the response stream to buffer
    const chunks = [];
    let chunkCount = 0;
    for await (const chunk of speech) {
      chunks.push(Buffer.from(chunk));
      chunkCount++;
    }
    
    const audioBuffer = Buffer.concat(chunks);
    console.log("✅ TTS Debug: Audio buffer created successfully (", chunkCount, "chunks,", audioBuffer.length, "bytes)");
    return audioBuffer;
  } catch (error) {
    console.error("❌ TTS Error Details:");
    console.error("  - Error message:", error.message);
    console.error("  - Error name:", error.name);
    
    // Check for ElevenLabs API error structure
    if (error.response) {
      console.error("  - HTTP Status:", error.response.status);
      console.error("  - Response data:", JSON.stringify(error.response.data, null, 2));
    }
    
    // Check for permission errors
    const errorStr = JSON.stringify(error).toLowerCase();
    if (errorStr.includes("permission") || errorStr.includes("access denied") || errorStr.includes("unauthorized")) {
      console.error("  - ⚠️  CRITICAL: API key missing Text-to-Speech permissions!");
      console.error("  - 💡 SOLUTION: Go to https://elevenlabs.io/app/settings/api-keys");
      console.error("  - 💡 Click 'Edit' on your API key");
      console.error("  - 💡 Under 'Endpoints', set 'Text to Speech' to 'Access'");
      console.error("  - 💡 Click 'Save Changes'");
    } else if (error.message && (error.message.includes("API key") || error.message.includes("401") || error.message.includes("403"))) {
      console.error("  - ⚠️  Issue: API key authentication failed");
      console.error("  - 💡 Solution: Check if your API key is valid and has TTS permissions");
    } else if (error.message && error.message.includes("voice")) {
      console.error("  - ⚠️  Issue: Voice ID not found or not accessible");
      console.error("  - 💡 Solution: Check if voice ID", EDEN_VOICE_ID, "exists and is available");
    } else {
      console.error("  - Full error object:", JSON.stringify(error, null, 2));
    }
    return null;
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sensorData, includeAudio } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured in .env file" });
    }

    const context = sensorData
      ? `Sensor data: ${JSON.stringify(sensorData)}. `
      : "";
    const prompt = `${context}${message}`;
    
    // Use the API according to @google/genai documentation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    // Extract text from response (response.text is a getter)
    const text = response.text;
    
    const result = { reply: text };

    // Generate audio if requested
    if (includeAudio) {
      console.log("🔍 TTS Debug: Audio requested for chat response");
      if (!process.env.ELEVENLABS_API_KEY) {
        console.error("❌ TTS Error: ELEVENLABS_API_KEY not found in environment");
        result.audioError = "TTS API key not configured";
      } else {
        const audioBuffer = await speakEdenResponse(text);
        if (audioBuffer) {
          result.audio = audioBuffer.toString('base64');
          result.audioFormat = 'mp3';
          console.log("✅ TTS Debug: Audio generated and attached to response");
        } else {
          console.error("❌ TTS Error: Audio generation returned null");
          result.audioError = "Failed to generate audio";
        }
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Gemini API failed: " + error.message });
  }
});

// Separate endpoint for audio-only generation
app.post("/api/chat/audio", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      console.error("❌ TTS Error: No text provided to audio endpoint");
      return res.status(400).json({ error: "Text is required" });
    }

    console.log("🔍 TTS Debug: Audio endpoint called with text length:", text.length);
    
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("❌ TTS Error: ELEVENLABS_API_KEY not configured");
      return res.status(500).json({ error: "TTS API key not configured" });
    }

    const audioBuffer = await speakEdenResponse(text);
    if (!audioBuffer) {
      console.error("❌ TTS Error: speakEdenResponse returned null");
      return res.status(500).json({ 
        error: "Failed to generate audio. Check server logs for details.",
        hint: "This is usually caused by missing API key permissions. Ensure 'Text to Speech' is set to 'Access' in your ElevenLabs API key settings."
      });
    }

    console.log("✅ TTS Debug: Sending audio response (", audioBuffer.length, "bytes)");
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (error) {
    console.error("❌ TTS Error: Audio generation endpoint error:", error.message);
    console.error("  - Stack:", error.stack);
    res.status(500).json({ error: "Audio generation failed: " + error.message });
  }
});

// Proxy endpoint for ESP32 camera stream (to avoid CORS issues)
app.get("/api/camera-stream", (req, res) => {
  const esp32Url = process.env.ESP32_CAMERA_URL || process.env.VITE_ESP32_CAMERA_URL;
  
  if (!esp32Url) {
    return res.status(500).json({ error: "ESP32 camera URL not configured" });
  }

  // Parse the ESP32 URL
  const url = new URL(esp32Url);
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname + url.search,
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  };

  // Set headers for MJPEG stream
  res.setHeader("Content-Type", "multipart/x-mixed-replace; boundary=frame");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Proxy the stream from ESP32
  const proxyReq = http.request(options, (proxyRes) => {
    // Forward status code
    res.statusCode = proxyRes.statusCode;
    
    // Forward headers
    proxyRes.headers["access-control-allow-origin"] = "*";
    Object.keys(proxyRes.headers).forEach((key) => {
      res.setHeader(key, proxyRes.headers[key]);
    });

    // Pipe the stream
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (error) => {
    console.error("ESP32 camera proxy error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to connect to ESP32 camera" });
    }
  });

  proxyReq.end();
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Eden server running on port ${PORT}`));
