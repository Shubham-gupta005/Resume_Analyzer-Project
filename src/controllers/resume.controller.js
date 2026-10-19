const fs = require("fs");
const Resume = require("../models/Resume");
const {
  extractTextFromPDF,
} = require("../services/document/pdfParser.service");
const {
  parseResumeWithAI,
} = require("../services/intelligence/resumeParser.service");
const {
  evaluateResumeWithAI,
} = require("../services/intelligence/resumeEvaluation.service");

const uploadResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file) {
      console.warn("[Controller] Warning: Upload request received without a file.");
      return res.render("upload", {
        error: "No file uploaded or the file is not a valid PDF.",
      });
    }

    if (!jobDescription || !jobDescription.trim()) {
      console.warn("[Controller] Warning: Upload request received without Job Description.");
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }
      return res.render("upload", {
        error: "Job Description is required.",
      });
    }

    console.log(`\n--- [Controller] Starting Resume processing for: ${req.file.originalname} ---`);

    // Extract text from the uploaded PDF
    console.log("[Controller] Layer 1: Initiating PDF text extraction...");
    const extractedText = await extractTextFromPDF(req.file.path);
    console.log(`[Controller] Layer 1 Success: Extracted ${extractedText.length} characters.`);

    // Pass raw text to Layer 2: AI Understanding
    console.log("[Controller] Layer 2: Sending text to Gemini AI for structural parsing...");
    const structuredData = await parseResumeWithAI(extractedText);
    console.log("[Controller] Layer 2 Success: Structured resume JSON parsed successfully.");

    // Pass structured data to Layer 3: AI ATS Evaluation
    console.log("[Controller] Layer 3: Sending structured data and job description to Gemini AI for ATS Evaluation...");
    const evaluationData = await evaluateResumeWithAI(structuredData, jobDescription.trim());
    console.log(`[Controller] Layer 3 Success: ATS Evaluation finished (Score: ${evaluationData.atsScore}%).`);

    // Layer 4: Persistence
    console.log("[Controller] Layer 4: Storing structured resume, job description, and analysis in MongoDB...");
    const savedResume = await Resume.create({
      originalFileName: req.file.originalname,
      extractedText,
      structuredResume: structuredData,
      jobDescription: jobDescription.trim(),
      analysis: evaluationData,
    });
    console.log(`[Controller] Layer 4 Success: Saved to Database with ID: ${savedResume._id}`);

    // Layer 5: Cleanup Temporary File
    console.log("[Controller] Layer 5: Deleting temporary uploaded file from disk...");
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("[Controller] Layer 5 Error: Failed to delete temp file:", err);
        } else {
          console.log("[Controller] Layer 5 Success: Temporary file deleted.");
        }
      });
    }

    // Render the result view and pass the evaluation data to it
    console.log("[Controller] Rendering the evaluation results page.");
    console.log("----------------------------------------------------------------\n");
    res.render("result", { 
      evaluation: evaluationData, 
      resumeId: savedResume._id, 
      jobDescription: savedResume.jobDescription 
    });
  } catch (error) {
    console.error("[Controller] CRITICAL ERROR in resume analysis pipeline:", error);
    if (req.file && req.file.path) {
      console.log("[Controller] Cleaning up temporary file due to pipeline failure...");
      fs.unlink(req.file.path, () => {});
    }
    return res.redirect("/error?message=" + encodeURIComponent(error.message || "An error occurred during file processing."));
  }
};

const viewResumeResult = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      console.warn(`[Controller] Resume not found: ${resumeId}`);
      return res.redirect("/error?message=" + encodeURIComponent("Resume profile not found."));
    }
    res.render("result", { 
      evaluation: resume.analysis, 
      resumeId: resume._id, 
      jobDescription: resume.jobDescription 
    });
  } catch (error) {
    console.error("[Controller] Error loading resume result:", error);
    return res.redirect("/error?message=" + encodeURIComponent(error.message || "Failed to load resume result."));
  }
};

module.exports = { uploadResume, viewResumeResult };
