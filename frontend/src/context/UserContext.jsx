import axios from "axios";
import React, { createContext, useState, useEffect } from "react";

// ✅ Create and Export the Context here (Do not import it)
export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const ServerUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
  const [userData, setUserData] = useState(null);

  // State for Image Customization
  const [selectedImage, setSelectedImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const result = await axios.get(`${ServerUrl}/api/user/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(result.data.user);
    } catch (error) {
      console.error("User fetch error:", error);
      setUserData(null);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const token = localStorage.getItem("token");
      const result = await axios.post(
        `${ServerUrl}/api/user/askToAssistant`, 
        { command },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return result.data; 
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error.message);
      return { response: "I'm having trouble connecting to the server.", type: "error" };
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  return (
    <userDataContext.Provider value={{ 
      ServerUrl, 
      userData, 
      setUserData, 
      getGeminiResponse,
      // Shared State for Customization
      selectedImage, setSelectedImage,
      frontendImage, setFrontendImage,
      backendImage, setBackendImage
    }}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;