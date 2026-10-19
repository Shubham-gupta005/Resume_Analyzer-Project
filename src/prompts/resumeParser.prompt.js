const getResumeParsingPrompt = (resumeText) => {
  return `
You are an expert AI Resume Parser. Your task is to extract structured information from the provided raw resume text.
You must return ONLY a valid JSON object. Do not include any markdown formatting like \`\`\`json or \`\`\`. Do not include any explanations.

Extract the following fields. If a field is not found, leave it as an empty string or an empty array as appropriate.

Expected JSON Output Format:
{
  "name": "Full Name",
  "email": "Email Address",
  "phone": "Phone Number",
  "skills": ["Skill 1", "Skill 2"],
  "education": ["Degree 1 Details", "Degree 2 Details"],
  "projects": ["Project 1 Details", "Project 2 Details"],
  "experience": ["Experience 1 Details", "Experience 2 Details"]
}

Raw Resume Text:
"""${resumeText}"""
`;
};

module.exports = { getResumeParsingPrompt };
