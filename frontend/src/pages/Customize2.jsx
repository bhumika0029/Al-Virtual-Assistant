import React, { useContext, useState, useEffect } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";

const Customize2 = () => {
  const { userData, backendImage, selectedImage, ServerUrl, setUserData } = useContext(userDataContext);
  
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login"); 
  }, [navigate]);

  const handleUpdateAssistant = async () => {
    if (!assistantName.trim()) return setError("Name cannot be empty");

    setLoading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("assistantName", assistantName);

    // ✅ Logic: Check if it's a raw FILE (Upload) or a STRING (Preset)
    if (backendImage) {
      // User uploaded a custom file -> Send as file
      formData.append("assistantImage", backendImage); 
    } else if (selectedImage) {
      // User picked a preset -> Send as text URL
      formData.append("imageUrl", selectedImage); 
    }

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/user/update`,
        formData,
        {
          headers: {
            // ❌ DELETED: "Content-Type": "multipart/form-data" 
            // ✅ Let the browser set the boundary automatically!
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData(data.user);
      setLoading(false);
      navigate("/"); // Redirect home on success
    } catch (err) {
      console.error("❌ Update Error:", err);
      setLoading(false);
      setError(err.response?.data?.message || "Failed to update assistant");
    }
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col p-4 relative">
      <MdKeyboardBackspace 
        className="absolute top-6 left-6 text-white w-8 h-8 cursor-pointer hover:scale-110 transition-all" 
        onClick={() => navigate("/customize")} 
      />
      
      <h1 className="text-white text-2xl font-bold mb-4">
        Name Your Assistant
      </h1>

      <input
        type="text"
        placeholder="e.g. Jarvis, Friday, Alexa..."
        className="p-3 rounded-lg max-w-md w-full bg-white/10 border border-gray-500 text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 backdrop-blur-sm"
        required
        onChange={(e) => {
            setAssistantName(e.target.value);
            setError(""); 
        }}
        value={assistantName}
      />

      {assistantName && (
        <button
          className="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-500 hover:scale-105 transition-all duration-300 disabled:opacity-50"
          onClick={handleUpdateAssistant}
          disabled={loading}
        >
          {loading ? "Updating..." : "Create Your Assistant"}
        </button>
      )}

      {error && <p className="text-red-400 text-sm mt-3 bg-red-900/20 px-3 py-1 rounded">{error}</p>}
    </div>
  );
};

export default Customize2;