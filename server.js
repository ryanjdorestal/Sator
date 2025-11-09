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
const genAI = new GoogleGenAI({});

// Initialize ElevenLabs client for TTS (optional)
console.log("🔍 TTS Debug: Checking ElevenLabs API key...");
const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
let elevenlabs = null;

if (!elevenlabsApiKey) {
  console.warn("⚠️  TTS Warning: ELEVENLABS_API_KEY is not set in .env file");
  console.warn("⚠️  TTS will be disabled. Add ELEVENLABS_API_KEY to .env to enable voice responses.");
} else if (elevenlabsApiKey.length < 20) {
  console.error("❌ TTS Error: ELEVENLABS_API_KEY appears to be invalid (too short)");
} else {
  console.log("✅ TTS Debug: API key found (length:", elevenlabsApiKey.length, "characters)");
  console.log("🔍 TTS Debug: API key starts with:", elevenlabsApiKey.substring(0, 7) + "...");
  
  try {
    elevenlabs = new ElevenLabsClient({
      apiKey: elevenlabsApiKey,
    });
    console.log("✅ TTS: ElevenLabs client initialized successfully");
  } catch (error) {
    console.error("❌ TTS Error: Failed to initialize ElevenLabs client:", error.message);
  }
}

// Rachel's voice ID for Eden
const EDEN_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Function to generate speech from text
async function speakEdenResponse(text) {
  try {
    // Check if ElevenLabs client is initialized
    if (!elevenlabs) {
      console.error("❌ TTS Error: ElevenLabs client not initialized");
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

    // Build context with sensor data
    let context = "";
    if (sensorData) {
      // Determine Air Quality Index category
      const aqi = sensorData.airQuality;
      let aqiCategory = "";
      if (aqi <= 50) aqiCategory = "Good (safe for all activities)";
      else if (aqi <= 100) aqiCategory = "Moderate (acceptable quality)";
      else if (aqi <= 150) aqiCategory = "Unhealthy for Sensitive Groups (children, elderly, those with respiratory conditions should limit prolonged outdoor activity)";
      else if (aqi <= 200) aqiCategory = "Unhealthy (everyone may experience health effects; sensitive groups may experience more serious effects)";
      else if (aqi <= 300) aqiCategory = "Very Unhealthy (health alert; everyone may experience more serious health effects)";
      else aqiCategory = "Hazardous (emergency conditions; entire population is likely to be affected)";

      context = `You are Eden, an AI agricultural assistant. You have access to the following real-time data from the field:
      
Current Readings:
- Temperature: ${sensorData.temperature}°C
- Humidity: ${sensorData.humidity}%
- Light Intensity: ${sensorData.lightIntensity}%
- Air Quality Index (AQI): ${sensorData.airQuality} (0-600 scale) - ${aqiCategory}
  * AQI Scale Reference:
    0-50: Good
    51-100: Moderate
    101-150: Unhealthy for Sensitive Groups
    151-200: Unhealthy
    201-300: Very Unhealthy
    301-600: Hazardous
- Soil Nitrogen (N): ${sensorData.nitrogen} mg/kg
- Soil Phosphorus (P): ${sensorData.phosphorus} mg/kg
- Soil Potassium (K): ${sensorData.potassium} mg/kg
- Soil Moisture: ${sensorData.soilMoisture}%
- Last Updated: ${sensorData.lastUpdated}

Use this data to provide insightful, practical advice about agriculture, soil health, and crop management. 
When discussing air quality, reference the AQI category and its implications for field work and plant health.
Answer questions about the current conditions and provide recommendations based on the readings.

User's question: ${message}`;
    } else {
      context = `You are Eden, an AI agricultural assistant. Help the user with their agricultural questions.

User's question: ${message}`;
    }
    
    // Use the API according to @google/genai documentation
    console.log("🤖 Gemini: Sending request to AI...");
    console.log("🤖 Gemini: Context length:", context.length, "characters");
    
    let text;
    
    try {
      // Generate content using @google/genai (matching working commit)
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: context,
      });
      
      console.log("✅ Gemini: Response received");
      
      // Extract text from response (response.text is a getter)
      text = response.text;
             
      console.log("✅ Gemini: Text extracted, length:", text?.length || 0);
    } catch (geminiError) {
      console.error("❌ Gemini API call failed:");
      console.error("  Error message:", geminiError.message);
      console.error("  Error stack:", geminiError.stack);
      throw geminiError;
    }
    
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

// ThingSpeak API endpoints
app.get("/api/thingspeak/top", async (req, res) => {
  try {
    const channelId = process.env.THINGSPEAK_TOP_CHANNEL_ID;
    const readApiKey = process.env.THINGSPEAK_TOP_READ_KEY;
    
    console.log("📊 ThingSpeak Top: Channel ID exists:", !!channelId, "Read Key exists:", !!readApiKey);
    
    if (!channelId || !readApiKey) {
      console.error("❌ ThingSpeak Top: Missing credentials");
      return res.status(500).json({ error: "ThingSpeak top credentials not configured" });
    }

    // Get last entry and recent feeds
    console.log("🔍 ThingSpeak Top: Fetching data from channel", channelId);
    const [lastEntryRes, feedsRes] = await Promise.all([
      fetch(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${readApiKey}`),
      fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=100`)
    ]);

    console.log("📡 ThingSpeak Top: Last entry status:", lastEntryRes.status, "Feeds status:", feedsRes.status);

    if (!lastEntryRes.ok || !feedsRes.ok) {
      console.error("❌ ThingSpeak Top: API returned error status");
      return res.status(500).json({ error: "ThingSpeak API returned error" });
    }

    const lastEntry = await lastEntryRes.json();
    const feeds = await feedsRes.json();

    console.log("✅ ThingSpeak Top: Data received. Last entry has fields:", !!lastEntry.field1);
    console.log("📊 ThingSpeak Top: Sample values - Temp:", lastEntry.field1, "Humidity:", lastEntry.field2, "Light:", lastEntry.field3, "AQI:", lastEntry.field4);

    res.json({
      current: {
        temperature: parseFloat(lastEntry.field1) || 0,
        humidity: parseFloat(lastEntry.field2) || 0,
        lightPct: parseFloat(lastEntry.field3) || 0,
        airQuality: parseFloat(lastEntry.field4) || 0,
        timestamp: lastEntry.created_at
      },
      history: feeds.feeds ? feeds.feeds.map(feed => ({
        timestamp: feed.created_at,
        temperature: parseFloat(feed.field1) || 0,
        humidity: parseFloat(feed.field2) || 0,
        lightPct: parseFloat(feed.field3) || 0,
        airQuality: parseFloat(feed.field4) || 0
      })) : []
    });
  } catch (error) {
    console.error("❌ ThingSpeak top sensor fetch error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: "Failed to fetch top data: " + error.message });
  }
});

app.get("/api/thingspeak/bottom", async (req, res) => {
  try {
    const channelId = process.env.THINGSPEAK_BOTTOM_CHANNEL_ID;
    const readApiKey = process.env.THINGSPEAK_BOTTOM_READ_KEY;
    
    console.log("📊 ThingSpeak Bottom: Channel ID exists:", !!channelId, "Read Key exists:", !!readApiKey);
    
    if (!channelId || !readApiKey) {
      console.error("❌ ThingSpeak Bottom: Missing credentials");
      return res.status(500).json({ error: "ThingSpeak bottom credentials not configured" });
    }

    console.log("🔍 ThingSpeak Bottom: Fetching data from channel", channelId);
    const [lastEntryRes, feedsRes] = await Promise.all([
      fetch(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${readApiKey}`),
      fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=100`)
    ]);

    console.log("📡 ThingSpeak Bottom: Last entry status:", lastEntryRes.status, "Feeds status:", feedsRes.status);

    if (!lastEntryRes.ok || !feedsRes.ok) {
      console.error("❌ ThingSpeak Bottom: API returned error status");
      return res.status(500).json({ error: "ThingSpeak API returned error" });
    }

    const lastEntry = await lastEntryRes.json();
    const feeds = await feedsRes.json();

    console.log("✅ ThingSpeak Bottom: Data received. Last entry has fields:", !!lastEntry.field1);
    console.log("📊 ThingSpeak Bottom: Sample values - N:", lastEntry.field1, "P:", lastEntry.field2, "K:", lastEntry.field3, "Moisture:", lastEntry.field4);

    res.json({
      current: {
        nitrogen: parseInt(lastEntry.field1) || 0,
        phosphorus: parseInt(lastEntry.field2) || 0,
        potassium: parseInt(lastEntry.field3) || 0,
        soilMoisture: parseInt(lastEntry.field4) || 0,
        timestamp: lastEntry.created_at
      },
      history: feeds.feeds ? feeds.feeds.map(feed => ({
        timestamp: feed.created_at,
        nitrogen: parseInt(feed.field1) || 0,
        phosphorus: parseInt(feed.field2) || 0,
        potassium: parseInt(feed.field3) || 0,
        soilMoisture: parseInt(feed.field4) || 0
      })) : []
    });
  } catch (error) {
    console.error("❌ ThingSpeak bottom sensor fetch error:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: "Failed to fetch bottom data: " + error.message });
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
