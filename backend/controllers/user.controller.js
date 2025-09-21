import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import moment from "moment";
import geminiResponse from "../gemini.js"; // ✅ You forgot to import this

// ==============================
// Get current user
// ==============================
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("❌ Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==============================
// Update assistant
// ==============================
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res
      .status(200)
      .json({ message: "Assistant updated successfully", user });
  } catch (error) {
    console.error("❌ Update assistant error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==============================
// Ask to Assistant
// ==============================
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Save to history
    user.history.push({ command, date: new Date() });
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    // Call your assistant
    const gemResult = await geminiResponse(command, assistantName, userName);

    // Use gemResult directly (no need to parse JSON string)
    const type = gemResult.type || "general";

    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`,
        });

      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("HH:mm:ss")}`,
        });

      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current month is ${moment().format("MMMM")}`,
        });

      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        return res.json(gemResult);

      default:
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });
    }
  } catch (error) {
    console.error("❌ Ask to assistant error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

