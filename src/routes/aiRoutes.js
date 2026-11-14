const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/aiController");
const { aiLimiter } = require("../middlewares/securityMiddleware");

// Rate limit AI chat để bảo vệ quota Gemini & ngăn chặn DoS
router.post("/chat", aiLimiter, chatWithAI);

module.exports = router;
