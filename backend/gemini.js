import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  // 1. Empty input guard
  if (!command || !command.trim()) {
    return {
      type: "general",
      userInput: "",
      response: "I didn't catch that. Could you say it again?"
    };
  }

  try {
    // ⚠️ Make sure your .env uses this exact name: GOOGLE_API_KEY
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY; 
    if (!apiKey) {
      throw new Error("API Key missing. Check your .env file.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond ONLY with a valid JSON object like this:
{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" |
           "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" |
           "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<original user input>",
  "response": "<a short spoken response>"
}

Remove your name from userInput if it exists. Use "${userName}" if someone asks who created you.

Now your userInput: "${command}"`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await axios.post(apiUrl, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No valid response from Gemini API");

    // ✅ FIX: Clean markdown code blocks (```json ... ```) before parsing
    const jsonString = text.replace(/```json|```/g, "").trim();
    
    // ✅ Extract the first valid JSON object found
    const jsonMatched = jsonString.match(/{[\s\S]*}/);
    if (!jsonMatched) throw new Error("Gemini response is not valid JSON");

    return JSON.parse(jsonMatched[0]);

  } catch (error) {
    console.error("❌ Error in geminiResponse:", error.response?.data || error.message);
    // Return a fallback object so the frontend doesn't crash
    return {
      type: "general",
      userInput: command,
      response: "I'm having trouble connecting to my brain right now."
    };
  }
};

export default geminiResponse;