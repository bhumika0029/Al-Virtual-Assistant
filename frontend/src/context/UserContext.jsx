// context/userContext.jsx
import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

// ✅ Capitalize and keep consistent everywhere
const ServerUrl = import.meta.env.VITE_SERVER_URL || "https://al-virtual-assistant.onrender.com";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(null);

  // images for assistant customization
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Fetch current user
  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${ServerUrl}/api/auth/current`, {
        withCredentials: true, // cookie/session handling
      });
      setUserData(result.data.user);
      console.log("✅ Current User:", result.data.user);
    } catch (error) {
      console.error(
        "❌ Error fetching current user:",
        error.response?.data || error.message
      );
    }
  };
const getGeminiResponse = async (command) => {
  try {
    const token = localStorage.getItem("token"); // get token
    const result = await axios.post(
      `${ServerUrl}/api/user/askToAssistant`,
      { command },
      {
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    return result.data;
  } catch (error) {
    console.error(
      "❌ Error fetching Gemini response:",
      error.response?.data || error.message
    );
  }
};


  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    ServerUrl, // ✅ make sure frontend always uses this
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
