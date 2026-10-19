/**
 * Generates the prompt to instruct Gemini to create 5 subjective theory questions.
 * Tailored specifically to the candidate's structured resume data and target Job Description.
 */
const getTestGenerationPrompt = (resumeJson, jobDescription) => {
  return `
You are an expert Senior Technical Recruiter. Your task is to generate an AI Interview Readiness Test for a candidate.
This test will evaluate the candidate's suitability for a job role based on the Job Description and their Resume.

You must generate exactly 5 subjective theory questions.
Constraints for the questions:
1. They must be SUBJECTIVE THEORY questions only.
2. Absolutely NO coding questions.
3. Absolutely NO Multiple Choice Questions (MCQs), true/false questions, fill-in-the-blanks, or simple matching lists.
4. Each question should test conceptual understanding, system design, architectural principles, engineering trade-offs, or best practices.
5. They must be highly tailored to the candidate's resume skills/experience AND the target Job Description requirements.
6. The candidate must be able to write comprehensive answers to all 5 questions within a 60-minute timeframe.
7. Each question carries exactly 6 marks (making the test out of 30 marks total).

You must return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json or \`\`\`. Do not include any explanations or extra text outside the JSON.

Expected JSON Output Format:
{
  "questions": [
    {
      "question": "Explain how you would design a REST API to handle high-traffic read operations, highlighting caching strategies (like Redis) and database scaling mechanisms you have previously used.",
      "marks": 6
    },
    {
      "question": "Describe the event-driven architecture model. In what scenarios would you choose an event broker like Kafka or RabbitMQ over synchronous HTTP endpoints?",
      "marks": 6
    },
    {
      "question": "What are the common strategies for securing Node.js applications against SQL Injection and Cross-Site Scripting (XSS)? How have you applied these in your past projects?",
      "marks": 6
    },
    {
      "question": "Compare relational (SQL) and non-relational (NoSQL) database indexing. Under what conditions does indexing degrade write performance, and how do you mitigate this?",
      "marks": 6
    },
    {
      "question": "Explain the concept of containerization and microservices. How does Docker help in achieving environment consistency from local development to production?",
      "marks": 6
    }
  ]
}

Evaluate and generate questions for the following candidate resume data:
"""${JSON.stringify(resumeJson, null, 2)}"""

Against the following target Job Description:
"""${jobDescription}"""
`;
};

module.exports = { getTestGenerationPrompt };
