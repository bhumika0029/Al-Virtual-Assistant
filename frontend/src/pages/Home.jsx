import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ai from "../assets/ai.gif";
import userGif from "../assets/user.gif";
import { BiLogOut, BiEditAlt } from "react-icons/bi";

const Home = () => {
  const { userData, ServerUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // New State for UI feedback
  
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const synth = window.speechSynthesis;

  // ==============================
  // 1. Text-to-Speech (With Delay)
  // ==============================
  const speak = (text) => {
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;

    const lang = /[a-zA-Z]/.test(text) ? "en-US" : "hi-IN";
    utterance.lang = lang;

    const voices = synth.getVoices();
    let selectedVoice = voices.find((v) => v.lang === lang && /female|woman|google/i.test(v.name));
    if (!selectedVoice) selectedVoice = voices.find((v) => v.lang === lang) || voices[0];
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.rate = 1.0;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setAiText(""); 
      
      // ✅ FIX 429 ERRORS: Wait 2 seconds before listening again
      setTimeout(() => {
        if (recognitionRef.current && !listening) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.log("Mic restart ignored");
          }
        }
      }, 2000); 
    };

    synth.speak(utterance);
  };

  // ==============================
  // 2. Command Execution
  // ==============================
  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    
    speak(response);
    setAiText(response);

    let targetUrl = "";
    if (type === "google-search") targetUrl = `https://www.google.com/search?q=${encodeURIComponent(userInput)}`;
    if (type === "youtube-search" || type === "youtube-play") targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`;
    if (type === "instagram-open") targetUrl = "https://www.instagram.com/";
    if (type === "facebook-open") targetUrl = "https://www.facebook.com/";
    if (type === "calculator-open") targetUrl = "https://www.google.com/search?q=calculator";
    if (type === "weather-show") targetUrl = "https://www.google.com/search?q=weather";

    if (targetUrl) {
      // Wait for voice to start, then redirect in SAME TAB
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 1500);
    }
  };

  // ==============================
  // 3. Speech Recognition
  // ==============================
  useEffect(() => {
    if (!userData) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return console.error("Speech Recognition not supported.");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    
    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      const assistantName = userData?.assistantName?.toLowerCase() || "assistant";

      // Wake Word Logic
      if (transcript.toLowerCase().includes(assistantName)) {
        try {
          setUserText(transcript);
          recognition.stop(); 
          setIsProcessing(true); // Show loading state

          const data = await getGeminiResponse(transcript);
          
          setIsProcessing(false);
          if (data) handleCommand(data);
          
          setUserText(""); 
        } catch (err) {
          setIsProcessing(false);
          console.error("Gemini Error:", err);
          speak("I'm having trouble connecting right now.");
        }
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
      synth.cancel();
    };
  }, [userData]);

  // ==============================
  // 4. Logout Logic
  // ==============================
  const handleLogout = async () => {
    try {
      synth.cancel(); 
      await axios.post(`${ServerUrl}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("token");
      setUserData(null);
      navigate("/login");
    } catch (error) {
      localStorage.removeItem("token");
      setUserData(null);
      navigate("/login");
    }
  };

  if (!userData) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-t from-black to-[#030353] flex flex-col items-center justify-center gap-5 px-4 relative">
      
      {/* Top Right Actions */}
      <div className="absolute top-4 right-4 flex gap-3">
        <button 
          onClick={() => navigate("/customize")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <BiEditAlt /> <span className="hidden sm:inline">Customize</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/80 text-white hover:bg-red-700 transition-all"
        >
          <BiLogOut /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Assistant Avatar */}
      <div className="relative group">
        <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 p-1 shadow-[0_0_60px_rgba(59,130,246,0.6)] bg-black/50 transition-all duration-500
          ${isProcessing ? "border-yellow-400 shadow-yellow-400" : "border-blue-500 shadow-blue-500"}`}>
          <img
            src={userData.assistantImage}
            alt="Assistant"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        
        {/* Animations */}
        {listening && !isProcessing && (
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-50"></div>
        )}
        {isProcessing && (
          <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 border-r-transparent animate-spin"></div>
        )}
      </div>

      <div className="text-center z-10">
        <h1 className="text-white text-3xl font-bold tracking-tight drop-shadow-lg">
          {userData.assistantName}
        </h1>
        <p className={`text-sm mt-2 uppercase tracking-widest font-medium ${isProcessing ? "text-yellow-300 animate-pulse" : "text-cyan-300"}`}>
          {isProcessing ? "Thinking..." : listening ? "● Listening..." : "○ Sleeping"}
        </p>
      </div>

      {/* Visual Feedback Area */}
      <div className="flex flex-col items-center min-h-[120px] justify-center">
        {isSpeakingRef.current ? (
          <img src={ai} alt="AI talking" className="w-24 sm:w-32 mix-blend-screen" />
        ) : (
          <img src={userGif} alt="User listening" className="w-24 sm:w-32 opacity-30 mix-blend-screen" />
        )}
        
        <div className="max-w-xl mt-4 px-4">
          <p className="text-white text-lg sm:text-xl text-center font-medium leading-relaxed drop-shadow-md min-h-[3rem]">
            {userText || aiText || "Say my name to wake me up..."}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-white/20 text-[10px] uppercase tracking-widest">
        Powered by Gemini 1.5 Flash
      </div>
    </div>
  );
};

export default Home;