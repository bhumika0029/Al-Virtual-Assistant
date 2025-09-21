import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ai from "../assets/ai.gif";
import user from "../assets/user.gif";
import {BiMenuAltRight} from "react-icons/bi"


const Home = () => {
  const { userData, ServerUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const synth = window.speechSynthesis;

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(`${ServerUrl}/api/auth/logout`, {}, { withCredentials: true });
      setUserData(null);
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout Error:", error.response?.data || error.message);
      setUserData(null);
      navigate("/login");
    }
  };

  // Speak text
 // 👇 Replace your current speak() with this one
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  isSpeakingRef.current = true;

  // Detect language from text (if it contains English letters, use en-US)
  const lang = /[a-zA-Z]/.test(text) ? "en-US" : "hi-IN";
  utterance.lang = lang;

  // Get available voices
  const voices = synth.getVoices();

  // Try to pick a female voice in the correct language
  let selectedVoice =
    voices.find((v) => v.lang === lang && /female|woman/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith(lang.split("-")[0]) && /female|woman/i.test(v.name));

  // If no female voice, fallback to any voice in that language
  if (!selectedVoice) {
    selectedVoice =
      voices.find((v) => v.lang === lang) ||
      voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
  }

  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.onend = () => {
    isSpeakingRef.current = false;
    setAiText("");
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        if (err.name !== "InvalidStateError") console.error(err);
      }
    }
  };

  synth.speak(utterance);
};


  // Handle assistant commands
  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);

    if (type === "google-search") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
    }
    if (type === "calculator-open") window.open("https://www.google.com/search?q=calculator", "_blank");
    if (type === "instagram-open") window.open("https://www.instagram.com/", "_blank");
    if (type === "facebook-open") window.open("https://www.facebook.com/", "_blank");
    if (type === "weather-show") window.open("https://www.google.com/search?q=weather", "_blank");
    if (type === "youtube-search" || type === "youtube-play") {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
    }
  };

  // Initialize voice recognition
  useEffect(() => {
    if (!userData) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return console.warn("SpeechRecognition API not supported.");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onerror = (event) => console.error("❌ Recognition error:", event.error);

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
  

      if (userData?.assistantName && transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        try {
          setUserText(transcript);
          recognition.stop();
          setAiText("");
          setListening(false);

          const response = await getGeminiResponse(transcript);
          console.log("Gemini response:", response);

          if (response) handleCommand(response);
          setAiText(response.response);
            setUserText("");
        } catch (err) {
          console.error("❌ Error fetching Gemini response:", err);
        }
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
      setListening(false);
    };
  }, [userData, getGeminiResponse]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col gap-[15px]">
      {/* Logout */}
      <button
        className="w-auto px-4 py-3  mt-4 rounded-lg bg-gradient-to-r absolute top-[20px] right-[20px] from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold text-white"
        onClick={handleLogout}
      >
        Log Out
      </button>

      {/* Customize */}
      <button
        className="w-auto px-4 py-3 mt-4 rounded-lg   absolute top-[100px] right-[20px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold text-white"
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>

      {/* Assistant Card */}
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-2xl shadow-lg">
        <img src={userData.assistantImage} alt="Assistant" className="h-full object-cover rounded-2xl" />
      </div>

    <h1 className="text-white text-[18px] font-bold">I'm {userData.assistantName}</h1>


{!aiText && <img src={user} alt="User speaking" className="w-[200px]" />}
{aiText && <img src={ai} alt="AI responding" className="w-[200px]" />}
<h1 className="text-white text-[18px] font-bold">{userText ? userText : aiText? aiText :null}</h1>

      
    </div>
  );
};

export default Home;
