import React, { useContext, useRef } from "react";
import image1 from "../assets/image1.png";
import bg from "../assets/authBg.png";
import Card from "../components/Card";
import { RiImageAddLine } from "react-icons/ri";
import { MdKeyboardBackspace } from "react-icons/md";
// ✅ Correct Import in Card.jsx / Customize.jsx
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Customize = () => {
  const { 
    frontendImage, setFrontendImage, 
    setBackendImage, 
    selectedImage, setSelectedImage 
  } = useContext(userDataContext);
  
  const navigate = useNavigate();
  const inputImage = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
      setSelectedImage("input"); // Mark that we are using a custom upload
    }
  };

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col gap-6 relative">
      <MdKeyboardBackspace 
        className="absolute top-4 left-4 text-white w-8 h-8 cursor-pointer hover:scale-110 transition-all" 
        onClick={() => navigate("/")} 
      />
      
      <h1 className="text-white text-2xl font-bold mb-4">
        Select your Assistant Image
      </h1>

      {/* Cards Grid */}
      <div className="w-[90%] max-w-[800px] flex justify-center items-center flex-wrap gap-5">
        
        {/* ✅ No props needed! Card handles itself. */}
        <Card image={image1} />
        <Card image={bg} />
        {/* Add more <Card image={...} /> here */}

        {/* Manual Upload Card */}
        <div 
          className={`w-[80px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#030361] rounded-2xl border-2
          border-[#0000ff66] flex items-center justify-center hover:shadow-2xl hover:shadow-blue-950 hover:scale-105 
          hover:border-4 hover:border-white cursor-pointer transition-all duration-300 
          ${selectedImage === "input" ? "border-4 border-white shadow-2xl" : ""}`}
          onClick={() => inputImage.current.click()}
        >
          {!frontendImage && <RiImageAddLine className="text-white w-10 h-10" />}
          {frontendImage && <img src={frontendImage} className="w-full h-full object-cover rounded-xl" />}
        </div>
        
        <input 
            type="file" 
            accept="image/*" 
            hidden 
            ref={inputImage} 
            onChange={handleImage} 
        />
      </div>

      {selectedImage && (
        <button 
          className="mt-6 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg
          hover:bg-blue-500 hover:scale-105 transition-all duration-300 cursor-pointer" 
          onClick={() => navigate("/Customize2")}
        >
          Next →
        </button>
      )}
    </div>
  );
};

export default Customize;