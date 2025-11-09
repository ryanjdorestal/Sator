import { generateReply } from "../lib/geminiClient.js";

(async () => {
  const response = await generateReply("Connection test successful?");
  console.log(response);
})();

