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
// ✅ SMARTER CORS CONFIGURATION
// ===========================================
app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (Postman, Mobile Apps)
    if (!origin) return callback(null, true);

    // 2. Allow Localhost (Development)
    if (origin === "http://localhost:5173") return callback(null, true);

    // 3. Allow ANY Vercel URL (This fixes the Preview URL error)
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    // 4. Block everything else
    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
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