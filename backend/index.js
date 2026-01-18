import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.route.js";
import geminiResponse from "./gemini.js";

dotenv.config();
const app = express();

// ===========================================
// ✅ 1. DYNAMIC CORS CONFIGURATION
// ===========================================
const allowedOrigins = [
  "http://localhost:5173",                // 1. Local Development
  process.env.APP_CORS_ALLOWEDORIGINS     // 2. Production (Vercel URL set in Render)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin); // Debugging log
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB connection error:", err));

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));