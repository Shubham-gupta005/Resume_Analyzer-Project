const genAI = require("../../config/gemini");
const {
  getResumeEvaluationPrompt,
} = require("../../prompts/resumeEvaluation.prompt");

const evaluateResumeWithAI = async (resumeJson, jobDescription) => {
  try {
    console.log("[AI Evaluation Service] Preparing model for ATS evaluation...");
    // 1. Get model with JSON response configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 2. Generate Prompt using the Layer 2 JSON and job description
    const prompt = getResumeEvaluationPrompt(resumeJson, jobDescription);
    console.log("[AI Evaluation Service] Evaluation prompt generated. Calling Gemini API (gemini-2.5-flash)...");

    // 3. Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text().trim();
    console.log("[AI Evaluation Service] Received evaluation response. Attempting to parse JSON...");

    // 4. Parse and Validate JSON output
    try {
      const evaluationData = JSON.parse(aiText);

      // Validate the ATS Score bounds
      if (
        typeof evaluationData.atsScore !== "number" ||
        evaluationData.atsScore < 0 ||
        evaluationData.atsScore > 100
      ) {
        console.warn(`[AI Evaluation Service] Warning: Gemini returned invalid score type or range: ${evaluationData.atsScore}. Resetting to 0.`);
        evaluationData.atsScore = 0; // Fallback to 0 if Gemini hallucinated a non-number
      } else {
        console.log(`[AI Evaluation Service] ATS Score parsed successfully: ${evaluationData.atsScore}%`);
      }

      // Validate the Job Match Percentage bounds
      if (
        typeof evaluationData.jobMatchPercentage !== "number" ||
        evaluationData.jobMatchPercentage < 0 ||
        evaluationData.jobMatchPercentage > 100
      ) {
        console.warn(`[AI Evaluation Service] Warning: Gemini returned invalid job match percentage type or range: ${evaluationData.jobMatchPercentage}. Resetting to 0.`);
        evaluationData.jobMatchPercentage = 0; // Fallback to 0
      } else {
        console.log(`[AI Evaluation Service] Job Match Percentage parsed successfully: ${evaluationData.jobMatchPercentage}%`);
      }

      return evaluationData;
    } catch (parseError) {
      console.error("[AI Evaluation Service] JSON Parsing Error. AI Output was:", aiText);
      throw new Error("AI evaluation returned malformed JSON.");
    }
  } catch (error) {
    console.error("[AI Evaluation Service] ERROR evaluating resume:", error);
    throw new Error(error.message || "Failed to evaluate resume with AI.");
  }
};

module.exports = { evaluateResumeWithAI };
