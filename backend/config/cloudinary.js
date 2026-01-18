import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

// Ensure .env is loaded
dotenv.config();

const uploadOnCloudinary = async (filePath) => {
  // Config outside the try block to ensure it runs
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!filePath) return null;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto"
    });

    // Remove file from server after successful upload
    fs.unlinkSync(filePath); 
    
    // Return the full result object, not just the URL (for flexibility)
    return uploadResult; 

  } catch (error) {
    // 🔍 THIS IS THE CRITICAL FIX: Log the actual error
    console.error("❌ Cloudinary Error Details:", error); 
    
    // Remove the file even if upload fails so temp folder doesn't fill up
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return null;
  }
}

export default uploadOnCloudinary;