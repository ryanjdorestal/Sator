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
    
    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Gemini API failed: " + error.message });
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
