import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) throw new Error("GOOGLE_API_KEY not set in environment variables");

    // ✅ Use backticks for template literal
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
        "X-goog-api-key": apiKey,
      },
    });

    const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No valid response from Gemini API");

    // ✅ Try parsing JSON safely
    const jsonMatched = text.match(/{[\s\S]*}/);
    if (!jsonMatched) throw new Error("Gemini response is not valid JSON");

    return JSON.parse(jsonMatched[0]);
  } catch (error) {
    console.error("❌ Error in geminiResponse:", error.response?.data || error.message);
    throw error;
  }
};

export default geminiResponse;
