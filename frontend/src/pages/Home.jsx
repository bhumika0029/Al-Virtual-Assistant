import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ai from "../assets/ai.gif";
import user from "../assets/user.gif";
import { BiLogOut, BiEditAlt } from "react-icons/bi";

const Home = () => {
  const { userData, ServerUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
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
      await axios.post(
        `${ServerUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUserData(null);
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout Error:", error.response?.data || error.message);
      setUserData(null);
      navigate("/login");
    }
  };

  // Speak
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;
    const lang = /[a-zA-Z]/.test(text) ? "en-US" : "hi-IN";
    utterance.lang = lang;

    const voices = synth.getVoices();
    let selectedVoice =
      voices.find((v) => v.lang === lang && /female|woman/i.test(v.name)) ||
      voices.find(
        (v) =>
          v.lang.startsWith(lang.split("-")[0]) &&
          /female|woman/i.test(v.name)
      );
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

  // Commands
  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);
    if (type === "google-search")
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(userInput)}`,
        "_blank"
      );
    if (type === "calculator-open")
      window.open("https://www.google.com/search?q=calculator", "_blank");
    if (type === "instagram-open")
      window.open("https://www.instagram.com/", "_blank");
    if (type === "facebook-open")
      window.open("https://www.facebook.com/", "_blank");
    if (type === "weather-show")
      window.open("https://www.google.com/search?q=weather", "_blank");
    if (type === "youtube-search" || type === "youtube-play")
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          userInput
        )}`,
        "_blank"
      );
  };

  // Voice recognition
  useEffect(() => {
    if (!userData) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition)
      return console.warn("SpeechRecognition API not supported.");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) =>
      console.error("❌ Recognition error:", event.error);

    recognition.onresult = async (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();

      if (
        userData?.assistantName &&
        transcript
          .toLowerCase()
          .includes(userData.assistantName.toLowerCase())
      ) {
        try {
          setUserText(transcript);
          recognition.stop();
          setAiText("");
          setListening(false);

          const response = await getGeminiResponse(transcript);
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
    <div className="w-full h-screen overflow-hidden bg-gradient-to-t from-black to-[#030353] flex flex-col items-center justify-center gap-5 px-4 relative">
      {/* Top Right Buttons */}
      <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-3">
        {/* Logout */}
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all duration-300 font-semibold text-white text-sm sm:text-base"
          onClick={handleLogout}
        >
          <BiLogOut size={20} />
          <span className="hidden sm:block">Log Out</span>
        </button>

        {/* Customize */}
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold text-white text-sm sm:text-base"
          onClick={() => navigate("/customize")}
        >
          <BiEditAlt size={20} />
          <span className="hidden sm:block">Customize</span>
        </button>
      </div>

      {/* Assistant Card */}
      <div className="w-[70%] max-w-[320px] aspect-[3/4] flex justify-center items-center overflow-hidden rounded-2xl shadow-lg">
        <img
          src={userData.assistantImage}
          alt="Assistant"
          className="w-full h-full object-cover rounded-2xl"
        />
      </div>

      {/* Assistant Name */}
      <h1 className="text-white text-lg sm:text-xl font-bold text-center">
        I'm {userData.assistantName}
      </h1>

      {/* Talking Section */}
      <div className="flex flex-col items-center gap-2">
        {!aiText && (
          <img
            src={user}
            alt="User speaking"
            className="w-[100px] sm:w-[150px]"
          />
        )}
        {aiText && (
          <img
            src={ai}
            alt="AI responding"
            className="w-[100px] sm:w-[150px]"
          />
        )}
        <h1 className="text-white text-sm sm:text-lg font-bold text-center px-3 truncate max-w-[90vw]">
          {userText ? userText : aiText ? aiText : null}
        </h1>
      </div>
    </div>
  );
};

export default Home;
