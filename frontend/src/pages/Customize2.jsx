import React, { useContext, useState, useEffect } from "react";
import { userDataContext } from "../context/userContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {MdKeyboardBackspace} from "react-icons/md"

const Customize2 = () => {
  const { userData, backendImage, selectedImage, ServerUrl, setUserData } =
    useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect to login if no user/token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/SignIn");
  }, [navigate]);

  const handleUpdateAssistant = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to update your assistant");
      return;
    }

    const formData = new FormData();
    formData.append("assistantName", assistantName);
    if (backendImage) formData.append("assistantImage", backendImage);
    else if (selectedImage) formData.append("imageUrl", selectedImage);

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/user/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ send JWT properly
          },
        }
      );

      setUserData(data.user);
      console.log("✅ Assistant Updated:", data);
      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error("❌ Error updating assistant:", err.response?.data || err.message);
      setLoading(false);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col p-4 relative" >
      <MdKeyboardBackspace className="absolute top-[3px] left-[3px] text-white w-[25px] h-[25px] cursor-pointer" onClick={() => navigate("/customize")} />
      <h1 className="text-white text-2xl font-bold mb-4">
        Enter Your Assistant's Name
      </h1>

      <input
        type="text"
        placeholder="Enter your assistant's name"
        className="p-3 rounded-lg max-w-md w-full bg-white/10 border border-gray-500 text-white placeholder-gray-300 focus:outline-none focus:border-blue-400"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

      {assistantName && (
        <button
          className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 cursor-pointer"
          onClick={handleUpdateAssistant}
          disabled={loading}
        >
          {!loading ? "Create Your Assistant" : "loading..."}
        </button>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default Customize2;
