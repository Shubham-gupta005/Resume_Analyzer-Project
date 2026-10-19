const genAI = require("../../config/gemini");
const {
  getInterviewCoachPrompt,
} = require("../../prompts/interviewCoach.prompt");

/**
 * Sends conversation details, resume context, and latest user message to Gemini
 * to receive structured evaluation, suggestions, the next question, and recommended questions.
 */
const conductInterviewSession = async (
  resumeData,
  chatHistory,
  userMessage,
) => {
  try {
    console.log(
      "[AI Interview Coach Service] Preparing model for interview conversation...",
    );

    // 1. Get model with JSON response configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 2. Generate Prompt using the Resume Data, chatHistory, and userMessage
    const prompt = getInterviewCoachPrompt(
      resumeData,
      chatHistory,
      userMessage,
    );
    console.log(
      "[AI Interview Coach Service] Prompt generated. Calling Gemini API (gemini-2.5-flash)...",
    );

    // 3. Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text().trim();
    console.log(
      "[AI Interview Coach Service] Received response. Attempting to parse JSON...",
    );

    // 4. Parse and Validate JSON
    try {
      const parsedData = JSON.parse(aiText);

      // Ensure all required fields exist to prevent controller/frontend errors
      const structuredResult = {
        evaluation: parsedData.evaluation || "",
        suggestions: Array.isArray(parsedData.suggestions)
          ? parsedData.suggestions
          : [],
        interviewerMessage:
          parsedData.interviewerMessage || "Could you repeat that?",
        recommendedQuestions: Array.isArray(parsedData.recommendedQuestions)
          ? parsedData.recommendedQuestions
          : [],
      };

      console.log(
        "[AI Interview Coach Service] Response parsed and sanitized successfully.",
      );
      return structuredResult;
    } catch (parseError) {
      console.error(
        "[AI Interview Coach Service] JSON Parsing Error. AI Output was:",
        aiText,
      );
      throw new Error("AI returned malformed JSON.");
    }
  } catch (error) {
    console.error(
      "[AI Interview Coach Service] ERROR in interview coach service:",
      error,
    );
    throw new Error(
      error.message || "An error occurred while communicating with Gemini API.",
    );
  }
};

module.exports = { conductInterviewSession };
