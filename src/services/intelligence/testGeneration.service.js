const genAI = require("../../config/gemini");
const { getTestGenerationPrompt } = require("../../prompts/testPrompt");

/**
 * Generates 5 subjective test questions tailored to candidate resume and job description.
 * Utilizes Gemini-2.5-flash.
 */
const generateTestQuestions = async (resumeDoc) => {
  const resumeJson = resumeDoc.structuredResume || {};
  const jobDescription = resumeDoc.jobDescription || "";

  try {
    console.log("[AI Test Generation Service] Preparing model for test question generation...");
    
    // 1. Get model with JSON response configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 2. Generate Prompt using prompts layer
    const prompt = getTestGenerationPrompt(resumeJson, jobDescription);
    console.log("[AI Test Generation Service] Prompt generated. Calling Gemini API (gemini-2.5-flash)...");

    // 3. Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text().trim();
    console.log("[AI Test Generation Service] Received response. Attempting to parse JSON...");

    // 4. Parse and Validate JSON
    try {
      const parsedData = JSON.parse(aiText);

      // Validate structure: must contain a questions array and exactly 5 questions
      if (!parsedData || !Array.isArray(parsedData.questions)) {
        throw new Error("Invalid output format: questions property missing or not an array.");
      }

      // Force-sanitize each item
      const questionsList = parsedData.questions.slice(0, 5).map((q) => ({
        question:
          q.question ||
          "Describe a challenging technical problem you solved recently and your approach to debugging it.",
        marks: 6,
      }));

      if (questionsList.length < 5) {
        throw new Error("Gemini returned fewer than 5 questions.");
      }

      console.log(
        `[AI Test Generation Service] Successfully generated ${questionsList.length} questions.`,
      );

      return { questions: questionsList };
    } catch (parseError) {
      console.error(
        "[AI Test Generation Service] JSON Parsing Error. AI Output was:",
        aiText,
      );
      throw new Error(parseError.message || "AI returned malformed questions JSON.");
    }
  } catch (error) {
    console.error("[AI Test Generation Service] ERROR in test questions generation:", error);
    throw new Error(error.message || "Failed to generate test questions with AI.");
  }
};

module.exports = { generateTestQuestions };
