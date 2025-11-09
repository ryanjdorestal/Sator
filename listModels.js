import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = await genAI.listModels();
    
    console.log("Available models:");
    models.forEach(model => {
      console.log(`- ${model.name}`);
    });
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();

