const getInterviewCoachPrompt = (resumeData, chatHistory, userMessage) => {
  const structuredResume = resumeData.structuredResume || {};
  const analysis = resumeData.analysis || {};

  // Format resume details for context
  const name = structuredResume.name || "Candidate";
  const skills = Array.isArray(structuredResume.skills)
    ? structuredResume.skills.join(", ")
    : "None specified";
  const education = Array.isArray(structuredResume.education)
    ? structuredResume.education.join("; ")
    : "None specified";
  const projects = Array.isArray(structuredResume.projects)
    ? structuredResume.projects.join("\n- ")
    : "None specified";
  const experience = Array.isArray(structuredResume.experience)
    ? structuredResume.experience.join("\n- ")
    : "None specified";

  // Format ATS analysis
  const strengths = Array.isArray(analysis.strengths)
    ? analysis.strengths.join(", ")
    : "None specified";
  const weaknesses = Array.isArray(analysis.weaknesses)
    ? analysis.weaknesses.join(", ")
    : "None specified";
  const suggestions = Array.isArray(analysis.suggestions)
    ? analysis.suggestions.join(", ")
    : "None specified";

  // Format chat history
  let historyString = "";
  if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    historyString = chatHistory
      .map(
        (msg) =>
          `${msg.role === "candidate" ? "Candidate" : "Interviewer"}: ${msg.text}`,
      )
      .join("\n");
  } else {
    historyString =
      "No conversation history yet. This is the start of the interview.";
  }

  return `
You are a Senior Technical Interviewer conducting a mock technical interview for a candidate named ${name}. 
Your goal is to evaluate the candidate's skills, ask relevant questions based on their resume, provide constructive feedback on their answers, and guide them to improve.

CRITICAL: You must return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json or \`\`\`. Do not include any explanations.

Resume Context:
- Skills: ${skills}
- Education: ${education}
- Projects:
- ${projects}
- Experience:
- ${experience}

ATS Resume Evaluation Context:
- Strengths: ${strengths}
- Weaknesses: ${weaknesses}
- Suggestions: ${suggestions}

Conversation History so far:
${historyString}

Latest Candidate Message:
"${userMessage || "Hello, I am ready to start the mock interview."}"

Instructions:
1. If this is the start of the interview (no history, or Candidate says they are ready), introduce yourself as the Senior Technical Interviewer, welcome them, and ask the first interview question targeted at their skills or projects. Keep the "evaluation" and "suggestions" fields empty.
2. If the candidate has provided an answer to your previous question (i.e. we have conversation history and a candidate message), you must:
   - Evaluate the correctness, depth, and clarity of their answer in the "evaluation" field.
   - Provide 2-3 specific suggestions on how they could improve their response (e.g. mention specific technologies, architectural details, or star methodology) in the "suggestions" field.
   - Keep the flow natural. In the "interviewerMessage" field, acknowledge their answer, give a brief transition, and then ask the next logical interview question (either a deeper follow-up on the same topic, or transition to a new area of their resume).
3. Provide 2 related recommended questions in the "recommendedQuestions" field that the candidate could practice later.

Expected JSON Output Format:
{
  "evaluation": "Evaluation of the candidate's last response. Leave empty if this is the start.",
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2"
  ],
  "interviewerMessage": "Your reply: brief acknowledgement of their answer + next interview question.",
  "recommendedQuestions": [
    "Recommended prep question 1",
    "Recommended prep question 2"
  ]
}
`;
};

module.exports = { getInterviewCoachPrompt };
