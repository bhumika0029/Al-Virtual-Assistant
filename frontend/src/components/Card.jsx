import React, { useContext } from "react";
import { userDataContext } from "../context/UserContext";

const Card = ({ image }) => {
  // ✅ Now this works because we updated UserContext
  const { selectedImage, setFrontendImage, setBackendImage, setSelectedImage } = useContext(userDataContext);

  return (
    <div
      className={`w-[80px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#030361] rounded-2xl overflow-hidden border-2
        border-[#0000ff66] hover:shadow-2xl hover:shadow-blue-950 hover:scale-105 hover:border-4
        hover:border-white cursor-pointer transition-all duration-300
        ${selectedImage === image ? "border-4 border-white shadow-2xl shadow-blue-950 scale-105" : ""}`}
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
    >
      <img src={image} alt="assistant" className="w-full h-full object-cover" />
    </div>
  );
};

export default Card;