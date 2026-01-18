// routes/user.route.js
import express from "express";
import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/current", isAuth, getCurrentUser);
router.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);

// ✅ Fix: Changed /asktoassistant to /askToAssistant to match frontend
router.post("/askToAssistant", isAuth, askToAssistant);

export default router;