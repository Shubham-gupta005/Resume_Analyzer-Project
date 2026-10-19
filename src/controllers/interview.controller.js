const Resume = require("../models/Resume");
const {
  conductInterviewSession,
} = require("../services/intelligence/interviewCoach.service");

/**
 * Controller to handle conversation turns with the AI Interview Coach.
 * Expects JSON body: { resumeId, userMessage, chatHistory }
 */
const handleInterviewChat = async (req, res) => {
  try {
    const { resumeId, userMessage, chatHistory } = req.body;

    // 1. Validation
    if (!resumeId) {
      console.warn(
        "[Interview Controller] Warning: Request received without resumeId.",
      );
      return res.status(400).json({
        error: "Missing required parameter: resumeId is required.",
      });
    }

    console.log(
      `\n--- [Interview Controller] Chat turn request received for Resume: ${resumeId} ---`,
    );

    // 2. Fetch Resume context from database
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      console.warn(
        `[Interview Controller] Warning: Resume not found for ID ${resumeId}`,
      );
      return res.status(404).json({
        error: "Resume not found. Please upload/analyze a resume first.",
      });
    }

    // 3. Invoke Interview Coach service
    console.log(
      "[Interview Controller] Initiating session with AI Interview Coach service...",
    );
    const interviewData = await conductInterviewSession(
      resume,
      chatHistory || [],
      userMessage || "",
    );

    console.log(
      "[Interview Controller] Session call success. Returning structured response.",
    );
    console.log(
      "-----------------------------------------------------------------------\n",
    );

    // 4. Return structured JSON
    return res.status(200).json(interviewData);
  } catch (error) {
    console.error(
      "[Interview Controller] CRITICAL ERROR in interview session pipeline:",
      error,
    );
    return res.status(500).json({
      error:
        error.message ||
        "An error occurred during your interview coaching session.",
    });
  }
};

const renderInterviewPage = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      console.warn(
        `[Interview Controller] Resume not found for session page: ${resumeId}`,
      );
      return res.redirect("/error?message=" + encodeURIComponent("Resume profile not found."));
    }
    res.render("interview", { resume });
  } catch (error) {
    console.error(
      "[Interview Controller] Error rendering interview page:",
      error,
    );
    return res.redirect("/error?message=" + encodeURIComponent(error.message || "Failed to render interview page."));
  }
};

module.exports = { handleInterviewChat, renderInterviewPage };
