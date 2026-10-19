const getResumeEvaluationPrompt = (resumeJson, jobDescription) => {
  return `
You are an expert ATS (Applicant Tracking System) Evaluator and Career Advisor.
You are evaluating this resume for the specific job description provided below. Compare the candidate's resume against the Job Description requirements.

You must return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json or \`\`\`. Do not include any explanations or extra text outside the JSON.

Expected JSON Output Format:
{
  "atsScore": 85, 
  "jobMatchPercentage": 75,
  "skillsMatching": ["React", "Node.js", "MongoDB"],
  "skillsMissing": ["TypeScript", "Docker"],
  "strengths": ["Strong action verbs", "Clear project impact", "Good foundational experience in React"],
  "weaknesses": ["Missing specific metrics in experience", "No production experience with TypeScript mentioned"],
  "suggestions": ["Quantify achievements in the experience section", "Build a small portfolio project using TypeScript and Docker to show competence"],
  "missingKeywords": ["Agile", "CI/CD", "Cloud Computing", "Docker", "TypeScript"]
}

Evaluate the following resume data:
"""${JSON.stringify(resumeJson, null, 2)}"""

Against the following Job Description:
"""${jobDescription}"""
`;
};

module.exports = { getResumeEvaluationPrompt };
