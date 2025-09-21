import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder must exist
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s/g, "_"); // remove spaces
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({ storage });

export default upload;
