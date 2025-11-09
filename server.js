import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import http from "http";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Initialize GoogleGenAI - it automatically picks up GEMINI_API_KEY from environment
const ai = new GoogleGenAI({});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sensorData } = req.body;
    
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
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: context,
    });
    
    // Extract text from response (response.text is a getter)
    const text = response.text;
    
    res.json({ reply: text });
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
    
    if (!channelId || !readApiKey) {
      return res.status(500).json({ error: "ThingSpeak top credentials not configured" });
    }

    // Get last entry and recent feeds
    const [lastEntryRes, feedsRes] = await Promise.all([
      fetch(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${readApiKey}`),
      fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=100`)
    ]);

    const lastEntry = await lastEntryRes.json();
    const feeds = await feedsRes.json();

    res.json({
      current: {
        temperature: parseFloat(lastEntry.field1) || 0,
        humidity: parseFloat(lastEntry.field2) || 0,
        lightPct: parseFloat(lastEntry.field3) || 0,
        airQuality: parseFloat(lastEntry.field4) || 0,
        timestamp: lastEntry.created_at
      },
      history: feeds.feeds.map(feed => ({
        timestamp: feed.created_at,
        temperature: parseFloat(feed.field1) || 0,
        humidity: parseFloat(feed.field2) || 0,
        lightPct: parseFloat(feed.field3) || 0,
        airQuality: parseFloat(feed.field4) || 0
      }))
    });
  } catch (error) {
    console.error("ThingSpeak top sensor fetch error:", error);
    res.status(500).json({ error: "Failed to fetch top data" });
  }
});

app.get("/api/thingspeak/bottom", async (req, res) => {
  try {
    const channelId = process.env.THINGSPEAK_BOTTOM_CHANNEL_ID;
    const readApiKey = process.env.THINGSPEAK_BOTTOM_READ_KEY;
    
    if (!channelId || !readApiKey) {
      return res.status(500).json({ error: "ThingSpeak bottom credentials not configured" });
    }

    const [lastEntryRes, feedsRes] = await Promise.all([
      fetch(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${readApiKey}`),
      fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readApiKey}&results=100`)
    ]);

    const lastEntry = await lastEntryRes.json();
    const feeds = await feedsRes.json();

    res.json({
      current: {
        nitrogen: parseInt(lastEntry.field1) || 0,
        phosphorus: parseInt(lastEntry.field2) || 0,
        potassium: parseInt(lastEntry.field3) || 0,
        soilMoisture: parseInt(lastEntry.field4) || 0,
        timestamp: lastEntry.created_at
      },
      history: feeds.feeds.map(feed => ({
        timestamp: feed.created_at,
        nitrogen: parseInt(feed.field1) || 0,
        phosphorus: parseInt(feed.field2) || 0,
        potassium: parseInt(feed.field3) || 0,
        soilMoisture: parseInt(feed.field4) || 0
      }))
    });
  } catch (error) {
    console.error("ThingSpeak bottom sensor fetch error:", error);
    res.status(500).json({ error: "Failed to fetch bottom data" });
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
