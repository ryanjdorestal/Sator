import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function testGemini() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found in .env file");
      return;
    }

    console.log("🔑 API Key loaded:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Say: Gemini connection successful!");
    console.log("✅ Gemini Response:", result.response.text());
  } catch (error) {
    console.error("❌ Gemini Connection Failed:", error.message);
    
    if (error.message.includes("API_KEY_INVALID") || error.message.includes("401")) {
      console.error("\n💡 Your API key appears to be invalid.");
      console.error("   Please:");
      console.error("   1. Go to: https://aistudio.google.com/app/apikey");
      console.error("   2. Delete the current key if needed");
      console.error("   3. Generate a new API key");
      console.error("   4. Update .env file with the new key");
      console.error("   5. Run: npm run test:gemini");
    } else if (error.message.includes("404") || error.message.includes("not found")) {
      console.error("\n💡 Model not found. This could mean:");
      console.error("   - The API key doesn't have access to this model");
      console.error("   - The model name has changed");
      console.error("   - Try checking: https://aistudio.google.com/app/apikey");
    }
  }
}

testGemini();

