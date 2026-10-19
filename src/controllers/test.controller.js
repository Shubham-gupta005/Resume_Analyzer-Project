const crypto = require("crypto");
const Resume = require("../models/Resume");
const {
  generateTestQuestions,
} = require("../services/intelligence/testGeneration.service");
const {
  gradeTestAnswers,
} = require("../services/intelligence/testEvaluation.service");

// HMAC secret for signing test start timestamps to prevent cheating in stateless environments
const HMAC_SECRET =
  process.env.JWT_SECRET || "stateless-test-session-signature-secret-key-98765";

/**
 * Generates an HMAC signature for a combination of resume ID and start timestamp.
 */
const generateSessionToken = (resumeId, startTime) => {
  return crypto
    .createHmac("sha256", HMAC_SECRET)
    .update(`${resumeId}-${startTime}`)
    .digest("hex");
};

/**
 * Verifies that a client-submitted token matches the expected HMAC for the resume and timestamp.
 */
const verifySessionToken = (resumeId, startTime, token) => {
  const expectedToken = generateSessionToken(resumeId, startTime);
  return crypto.timingSafeEqual(
    Buffer.from(token, "utf-8"),
    Buffer.from(expectedToken, "utf-8"),
  );
};

/**
 * GET /test/session/:resumeId
 * Generates test questions and renders the test setup page.
 */
const renderTestPage = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // 1. Fetch Resume context from database
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      console.warn(
        `[Test Controller] Warning: Resume not found for ID: ${resumeId}`,
      );
      return res.redirect("/error?message=" + encodeURIComponent("Resume profile not found."));
    }

    // 2. Prevent entry if candidate already finished the test (duplicate check)
    if (resume.testResult && resume.testResult.testScore !== null) {
      console.warn(
        `[Test Controller] Warning: Candidate tried to restart completed test for Resume ID: ${resumeId}`,
      );
      return res.redirect("/error?message=" + encodeURIComponent("You have already completed the readiness test for this resume. Retakes are not allowed."));
    }

    console.log(
      `\n--- [Test Controller] Generating interview readiness questions for Resume ID: ${resumeId} ---`,
    );

    // 3. Invoke Generation Service
    const questionsData = await generateTestQuestions(resume);

    // 4. Generate security token for stateless timer enforcement
    const startTime = Date.now();
    const token = generateSessionToken(resumeId.toString(), startTime);

    console.log(
      "[Test Controller] Questions generated and session token created. Rendering test page.",
    );
    console.log(
      "------------------------------------------------------------------------------------\n",
    );

    // 5. Render EJS view
    return res.status(200).render("test", {
      resume,
      questions: questionsData.questions,
      startTime,
      token,
    });
  } catch (error) {
    console.error("[Test Controller] Error rendering test page:", error);
    return res.redirect("/error?message=" + encodeURIComponent(error.message || "Failed to render test page."));
  }
};

/**
 * POST /test/submit/:resumeId
 * Validates session expiry, grades answers, saves overall results, and shows final grading page.
 */
const evaluateTest = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { startTime, token, questions: clientQuestions, answers } = req.body;

    // 1. Basic validation
    if (!startTime || !token || !clientQuestions || !answers) {
      console.warn("[Test Controller] Error: Submission parameters missing.");
      return res.redirect("/error?message=" + encodeURIComponent("Missing required test submission parameters. Session invalid."));
    }

    // 2. Fetch Resume context
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      console.warn(
        `[Test Controller] Error: Resume not found for evaluation ID: ${resumeId}`,
      );
      return res.redirect("/error?message=" + encodeURIComponent("Resume profile not found."));
    }

    // 3. Security Check: Verify session token signature
    let isValidToken = false;
    try {
      isValidToken = verifySessionToken(
        resumeId.toString(),
        parseInt(startTime, 10),
        token,
      );
    } catch (e) {
      isValidToken = false;
    }

    if (!isValidToken) {
      console.warn(
        `[Test Controller] CRITICAL: Session signature verification failed for Resume ID: ${resumeId}`,
      );
      return res.redirect("/error?message=" + encodeURIComponent("Security Check Failed: Invalid test session token. Please try again."));
    }

    // 4. Time Expiration Check: limit is 60 minutes + 2 minutes network latency grace period
    const startMs = parseInt(startTime, 10);
    const timeElapsedMs = Date.now() - startMs;
    const maxAllowedMs = 60 * 60 * 1000 + 2 * 60 * 1000; // 62 minutes total

    if (timeElapsedMs > maxAllowedMs) {
      console.warn(
        `[Test Controller] Warning: Session expired for Resume ID: ${resumeId}. Elapsed: ${Math.round(timeElapsedMs / 60000)} mins`,
      );
      return res.redirect("/error?message=" + encodeURIComponent("Test Session Expired: You exceeded the 60-minute time limit for this exam."));
    }

    // 5. Prevent Duplicate Submission: Check database to ensure score is not already set
    if (resume.testResult && resume.testResult.testScore !== null) {
      console.warn(
        `[Test Controller] Warning: Blocked duplicate test evaluation submission for Resume ID: ${resumeId}`,
      );
      return res.redirect("/error?message=" + encodeURIComponent("Duplicate Submission: You have already submitted answers for this test and received a grade."));
    }

    console.log(
      `\n--- [Test Controller] Processing submission grading for Resume ID: ${resumeId} ---`,
    );

    // Parse questions array back to standard structure
    // Client sends it as strings or object structure
    let questionsParsed = [];
    try {
      questionsParsed =
        typeof clientQuestions === "string"
          ? JSON.parse(clientQuestions)
          : clientQuestions;
    } catch (e) {
      questionsParsed = clientQuestions;
    }

    // 6. Invoke AI Evaluation Service
    const evaluation = await gradeTestAnswers(resume, questionsParsed, answers);

    // 7. Persist aggregate score and feedback into Resume document
    console.log("[Test Controller] Saving aggregate scores into MongoDB...");
    resume.testResult = {
      testScore: evaluation.totalScore,
      testFeedback: evaluation.overallFeedback,
    };
    await resume.save();
    console.log("[Test Controller] Success: Saved test results to MongoDB.");

    console.log("[Test Controller] Rendering detailed grading dashboard.");
    console.log(
      "-----------------------------------------------------------\n",
    );

    // 8. Render Results Dashboard (carries detailed feedback but is stateless)
    return res.status(200).render("testResult", {
      resume,
      evaluation, // contains detailed questions, scores, and feedbacks
      questions: questionsParsed,
      answers,
    });
  } catch (error) {
    console.error(
      "[Test Controller] CRITICAL ERROR in test evaluation:",
      error,
    );
    return res.redirect("/error?message=" + encodeURIComponent(error.message || "An internal database or API error occurred while grading your test. Please try again."));
  }
};

module.exports = {
  renderTestPage,
  evaluateTest,
};
