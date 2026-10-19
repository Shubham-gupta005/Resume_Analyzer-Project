const express = require("express");
const router = express.Router();
const { handleInterviewChat, renderInterviewPage } = require("../controllers/interview.controller");

// POST /interview/chat
router.post("/chat", handleInterviewChat);

// GET /interview/session/:resumeId
router.get("/session/:resumeId", renderInterviewPage);

module.exports = router;
