import React, { useContext } from "react";
import { userDataContext } from "../context/userContext";

const Card = ({ image }) => {
  const { selectedImage, setFrontendImage, setBackendImage ,setSelectedImage } = useContext(userDataContext);

  return (
    <div
      className={`w-[80px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#030361] rounded-2xl overflow-hidden border-2
        border-[#0000ff66] hover:shadow-2xl hover:shadow-blue-950 hover:scale-105 hover:border-4
        hover:border-white cursor-pointer transition-all duration-300
        ${selectedImage == image ? "border-4 border-white hover:shadow-2xl hover:shadow-blue-950 " :null}`}
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
