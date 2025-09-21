import React from "react";
import image1 from "../assets/image1.png";
import bg from "../assets/authBg.png";
import Card from "../components/Card";
import { RiImageAddLine } from "react-icons/ri";
import { useRef } from "react";
import { MdKeyboardBackspace } from "react-icons/md";

import { useContext } from "react";
import { userDataContext } from "../context/userContext";
import { Navigate, useNavigate } from "react-router-dom";


const Customize = () => {
  const { frontendImage, setFrontendImage, backendImage, setBackendImage, selectedImage, setSelectedImage } = useContext(userDataContext);
const navigate=useNavigate();
const inputImage = useRef(null);
const handleImage = (e) => {
  const file = e.target.files[0]
  setBackendImage(file);
  setFrontendImage(URL.createObjectURL(file));
}
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex justify-center items-center flex-col gap-6">
     <MdKeyboardBackspace className="absolute top-[3px] left-[3px] text-white w-[25px] h-[25px] cursor-pointer" onClick={() => navigate("/")} />
      <h1 className="text-white text-2xl font-bold mb-4">
        Select your Assistant Image
      </h1>

      {/* Cards Grid */}
      <div className="w-[90%] max-w-[60%] flex justify-center items-center flex-wrap gap-5">
        <Card image={image1} />
        <Card image={bg} />
        <Card image={image1} />
        <Card image={image1} />
        <Card image={image1} />
        <Card image={image1} />
        <Card image={image1} />

        {/* Add Image Card */}
        <div className={`w-[80px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#030361] rounded-2xl border-2
         border-[#0000ff66] flex items-center justify-center hover:shadow-2xl hover:shadow-blue-950 hover:scale-105 
         hover:border-4 hover:border-white cursor-pointer transition-all duration-300 ${selectedImage == "input" ? "border-4 border-white hover:shadow-2xl hover:shadow-blue-950 " :null}`}
       onClick={() => {
  inputImage.current.click();
  setSelectedImage("input"); 
  // setBackendImage(null);
  // setFrontendImage(null);
}}
 >
          {!frontendImage &&   <RiImageAddLine className="text-white w-10 h-10" />}
        {frontendImage && <img src={frontendImage} className="w-full h-full object-cover" />}
        
        </div>
        <input type="file" accept="image/*" hidden ref={inputImage} onChange={handleImage} />
      </div>
      {selectedImage &&<button className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-lg
       hover:bg-blue-700 hover:scale-105 transition-all duration-300 cursor-pointer " onClick={() => navigate("/Customize2")}
>
        Next →
      </button>}
    </div>
  );
};

export default Customize;
