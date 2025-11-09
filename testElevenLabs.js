import fs from "fs";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import dotenv from "dotenv";

dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function testTTS() {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("❌ ELEVENLABS_API_KEY not found in .env file");
      return;
    }

    console.log("🔑 API Key loaded:", process.env.ELEVENLABS_API_KEY.substring(0, 10) + "...");
    console.log("🎤 Generating voice output with Rachel voice...");

    // Rachel's voice ID (commonly used ElevenLabs voice)
    // If this doesn't work, you can find your voice ID at: https://elevenlabs.io/app/voices
    const rachelVoiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice ID
    
    const speech = await client.textToSpeech.convert(rachelVoiceId, {
      text: "Testing Eden voice output for Sator.",
      model_id: "eleven_turbo_v2",
    });

    // Convert the response to buffer
    const chunks = [];
    for await (const chunk of speech) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);
    
    fs.writeFileSync("eden-test-output.mp3", audioBuffer);
    console.log("✅ Voice generated: eden-test-output.mp3");
    console.log("   File saved in project root directory");
  } catch (error) {
    console.error("❌ ElevenLabs TTS Failed:", error.message);
    if (error.message.includes("401") || error.message.includes("Unauthorized") || error.message.includes("missing_permissions")) {
      console.error("\n💡 API key issue detected.");
      console.error("   Please check your API key at: https://elevenlabs.io/app/settings/api-keys");
      console.error("   Ensure your API key has text-to-speech permissions enabled.");
    } else if (error.message.includes("404") || error.message.includes("not found")) {
      console.error("\n💡 Voice ID not found.");
      console.error("   You may need to use a different voice ID.");
      console.error("   Find available voices at: https://elevenlabs.io/app/voices");
    } else {
      console.error("\n💡 Full error:", error);
    }
  }
}

testTTS().catch(console.error);

