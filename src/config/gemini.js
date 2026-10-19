const { GoogleGenerativeAI } = require("@google/generative-ai");

// Check for the presence of the Gemini API Key on application boot
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL WARNING: GEMINI_API_KEY is not set in the environment variables.");
}

// Initialize the Google Generative AI client singleton
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

module.exports = genAI;
