const express = require("express");
const router = express.Router();
const { uploadResume, viewResumeResult } = require("../controllers/resume.controller");
const upload = require("../middlewares/multer.middleware");

// POST /resume/upload
router.post("/upload", upload.single("resume"), uploadResume);

// GET /resume/result/:resumeId
router.get("/result/:resumeId", viewResumeResult);

module.exports = router;
