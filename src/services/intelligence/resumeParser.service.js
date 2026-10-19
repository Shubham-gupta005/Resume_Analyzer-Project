const genAI = require("../../config/gemini");
const { getResumeParsingPrompt } = require("../../prompts/resumeParser.prompt");

const parseResumeWithAI = async (resumeText) => {
  try {
    console.log(`[AI Parser Service] Received raw text (${resumeText.length} chars). Preparing model...`);
    // 1. Get model with JSON response configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    // 2. Generate Prompt
    const prompt = getResumeParsingPrompt(resumeText);
    console.log("[AI Parser Service] Prompt generated. Calling Gemini API (gemini-2.5-flash)...");

    // 3. Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text().trim();
    console.log("[AI Parser Service] Received response from Gemini. Attempting to parse JSON...");

    // 4. Parse and Validate JSON
    try {
      const parsedData = JSON.parse(aiText);
      console.log("[AI Parser Service] JSON parsed successfully. Structured fields found:", Object.keys(parsedData));
      return parsedData;
    } catch (parseError) {
      console.error("[AI Parser Service] JSON Parsing Error. AI Output was:", aiText);
      throw new Error("AI returned malformed JSON.");
    }
  } catch (error) {
    console.error("[AI Parser Service] ERROR parsing resume text:", error);
    throw new Error(error.message || "Failed to parse resume with AI.");
  }
};

module.exports = { parseResumeWithAI };
