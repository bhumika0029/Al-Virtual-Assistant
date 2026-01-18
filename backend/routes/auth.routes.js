import express from "express";
import { signUp, login, logout } from "../controllers/auth.controller.js";
import { getCurrentUser, askToAssistant } from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);

// ✅ Fixes the 404: Context calls /api/auth/current
router.get("/current", isAuth, getCurrentUser);

// ✅ Use isAuth here to fix the 500 error
router.post("/askToAssistant", isAuth, askToAssistant);

export default router;