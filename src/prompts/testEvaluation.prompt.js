/**
 * Generates the prompt to grade the candidate's answers to the readiness test.
 * Instructs Gemini to act as a Senior Technical Interviewer.
 */
const getTestEvaluationPrompt = (
  resumeJson,
  jobDescription,
  questions,
  answers,
) => {
  // Combine questions and answers for clear prompt matching
  const QAData = questions.map((q, idx) => ({
    questionIndex: idx + 1,
    question: q.question,
    maxMarks: q.marks || 6,
    candidateAnswer: answers[idx] || "",
  }));

  return `
You are a Senior Technical Interviewer and technical domain expert.
Your job is to grade a candidate's written answers to an AI Interview Readiness Test.

The candidate's Resume and the target Job Description are provided below for context on expectations and candidate background.

Here are the Questions, their Max Marks (6 each), and the Candidate's Answers:
"""${JSON.stringify(QAData, null, 2)}"""

Your instructions:
1. Carefully read and evaluate the candidate's answer for each question.
2. Award a score between 0 and 6 for each question based on correctness, technical depth, and conceptual clarity.
3. Provide objective, helpful feedback for each question's answer, pointing out strengths and gaps.
4. Sum the individual question scores to compute "totalScore" (maximum is 30).
5. Calculate the percentage: (totalScore / 30) * 100.
6. Provide "overallFeedback" reflecting the candidate's technical readiness, strengths observed across the test, and key themes/topics they need to study further.

You must return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json or \`\`\`. Do not include any explanations or extra text outside the JSON.

Expected JSON Output Format:
{
  "questions": [
    {
      "score": 5,
      "feedback": "The candidate explained the event loop and asynchronous callbacks well. However, they forgot to explain the role of the microtask queue (e.g. Promises) versus the macrotask queue."
    },
    {
      "score": 3,
      "feedback": "A very brief answer that only mentions SQL indexing in passing. Missed explaining how index structures like B-Trees work and didn't mention trade-offs on write performance."
    },
    ... (exactly 5 items matching the questions)
  ],
  "totalScore": 22,
  "percentage": 73.3,
  "overallFeedback": "Overall, the candidate displays strong fundamentals in JavaScript and Node.js backend architecture. However, they need to bolster their knowledge of database query optimization and index structures. They are moderately ready for a technical interview, but must work on detailing their design trade-offs."
}

Resume context:
"""${JSON.stringify(resumeJson, null, 2)}"""

Job Description context:
"""${jobDescription}"""
`;
};

module.exports = { getTestEvaluationPrompt };
