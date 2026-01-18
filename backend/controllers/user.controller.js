import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";

// ==============================
// 1. Get current user
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
// 2. Update assistant (Optimized)
// ==============================
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    
    // ✅ Create a dynamic object. Always update the name.
    const updateData = { assistantName };

    // Case 1: User picked a Preset Image (String URL)
    if (imageUrl) {
      updateData.assistantImage = imageUrl;
    }

    // Case 2: User Uploaded a File (Overwrites preset if both exist)
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (uploadResult) {
        updateData.assistantImage = uploadResult.secure_url;
      }
    }

    // Update only the fields that exist in updateData
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select("-password");

    return res.status(200).json({ message: "Assistant updated successfully", user });
  } catch (error) {
    console.error("❌ Update assistant error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==============================
// 3. Ask to Assistant (With History Limit)
// ==============================
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const result = await geminiResponse(command, user.assistantName, user.name);

    // Safety check
    if (!user.history) user.history = [];
    
    // Add new command
    user.history.push({ command, date: new Date() });

    // ✅ OPTIMIZATION: Keep only the last 50 items to prevent DB bloat
    if (user.history.length > 50) {
      user.history = user.history.slice(-50);
    }

    await user.save();

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Controller Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};