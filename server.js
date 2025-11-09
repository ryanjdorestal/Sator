import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sensorData } = req.body;
    const context = sensorData
      ? `Sensor data: ${JSON.stringify(sensorData)}. `
      : "";
    const prompt = `${context}${message}`;
    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gemini API failed." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Eden server running on port ${PORT}`));
