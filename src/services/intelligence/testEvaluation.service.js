const genAI = require("../../config/gemini");
const {
  getTestEvaluationPrompt,
} = require("../../prompts/testEvaluation.prompt");

/**
 * Grades the candidate's test submissions.
 * Uses Gemini-2.5-flash.
 */
const gradeTestAnswers = async (resumeDoc, questions, answers) => {
  const resumeJson = resumeDoc.structuredResume || {};
  const jobDescription = resumeDoc.jobDescription || "";

  try {
    console.log(
      "[AI Test Evaluation Service] Preparing model for answer grading...",
    );

    // 1. Get model with JSON response configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 2. Generate Prompt using prompts layer
    const prompt = getTestEvaluationPrompt(
      resumeJson,
      jobDescription,
      questions,
      answers,
    );
    console.log(
      "[AI Test Evaluation Service] Evaluation prompt generated. Calling Gemini API (gemini-2.5-flash)...",
    );

    // 3. Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text().trim();
    console.log(
      "[AI Test Evaluation Service] Received grading response. Attempting to parse JSON...",
    );

    // 4. Parse and Validate JSON
    try {
      const parsedData = JSON.parse(aiText);

      // Validate structure: must contain a questions array and overall metrics
      if (!parsedData || !Array.isArray(parsedData.questions)) {
        throw new Error(
          "Invalid grading format: questions property missing or not an array.",
        );
      }

      // Sanitize fields
      const gradedQuestions = parsedData.questions.map((q, idx) => {
        let score = typeof q.score === "number" ? q.score : 0;
        if (score < 0) score = 0;
        if (score > 6) score = 6;
        return {
          score,
          feedback: q.feedback || "Answer parsed and evaluated.",
        };
      });

      let totalScore =
        typeof parsedData.totalScore === "number" ? parsedData.totalScore : 0;
      if (totalScore < 0) totalScore = 0;
      if (totalScore > 30) totalScore = 30;

      let percentage =
        typeof parsedData.percentage === "number" ? parsedData.percentage : 0;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;

      const overallFeedback =
        parsedData.overallFeedback || "Evaluation completed successfully.";

      return {
        questions: gradedQuestions,
        totalScore,
        percentage: parseFloat(percentage.toFixed(1)),
        overallFeedback,
      };
    } catch (parseError) {
      console.error(
        "[AI Test Evaluation Service] JSON Parsing Error. AI Output was:",
        aiText,
      );
      throw new Error("AI returned malformed grading JSON.");
    }
  } catch (error) {
    console.error("[AI Test Evaluation Service] ERROR in technical assessment evaluation:", error);
    throw new Error(error.message || "Failed to grade answers with AI.");
  }
};

module.exports = { gradeTestAnswers };
