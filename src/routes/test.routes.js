const express = require("express");
const router = express.Router();
const { renderTestPage, evaluateTest } = require("../controllers/test.controller");


// GET /test/session/:resumeId
// Generates readiness questions and serves the test-taking screen
router.get("/session/:resumeId", renderTestPage);

// POST /test/submit/:resumeId
// Processes and grades the submitted candidate answers, updating the DB record
router.post("/submit/:resumeId", evaluateTest);

module.exports = router;
