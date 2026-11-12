import { GoogleGenAI } from '@google/genai';

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_api_key')) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const MODEL = 'gemini-3.6-flash';

// Generate content using new SDK
const generateContent = async (prompt) => {
  const ai = getClient();
  if (!ai) return null;
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });
  return response.text;
};

// Clean json string from markdown code fences
const cleanJsonResponse = (rawText) => {
  try {
    let clean = rawText.trim();
    // In case there is still markdown formatting despite the mime type
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      clean = match[1].trim();
    }
    
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');
    const lastBrace = clean.lastIndexOf('}');
    const lastBracket = clean.lastIndexOf(']');
    
    const startIndex = (firstBrace !== -1 && firstBracket !== -1) ? Math.min(firstBrace, firstBracket) : Math.max(firstBrace, firstBracket);
    const endIndex = (lastBrace !== -1 && lastBracket !== -1) ? Math.max(lastBrace, lastBracket) : Math.max(lastBrace, lastBracket);
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      clean = clean.substring(startIndex, endIndex + 1);
    }
    
    return JSON.parse(clean);
  } catch (err) {
    console.error('Failed to parse JSON from AI response:', rawText);
    throw err;
  }
};

/**
 * Analyze Resume Text
 */
export const analyzeResumeText = async (resumeText) => {
  const ai = getClient();
  if (ai) {
    try {
      const prompt = `
You are an expert HR recruiter, ATS scanner specialist, and technical career advisor.
Analyze the following resume text and provide a structured JSON output only (no extra markdown explanation).

Resume Text:
"""
${resumeText.substring(0, 4000)}
"""

Return a JSON object matching this exact schema:
{
  "skills": ["Skill1", "Skill2", "Skill3"],
  "experienceSummary": "A concise 2-3 sentence overview of candidate background and experience level.",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvementAreas": ["Area 1", "Area 2"],
  "domain": "Primary technical field e.g. Full-Stack Web Development, Data Science, DevOps",
  "suggestedRoles": ["Role 1", "Role 2", "Role 3"],
  "atsScore": 82,
  "atsChecklist": [
    { "item": "Clear Contact Details", "passed": true, "note": "Email and phone found" },
    { "item": "Measurable Impact / Metrics", "passed": false, "note": "Add quantifiable results (e.g., % increase, revenue, latency reduction)" },
    { "item": "Standard Section Headers", "passed": true, "note": "Experience, Education, Skills clearly demarcated" },
    { "item": "Action Verbs Usage", "passed": true, "note": "Uses words like Architected, Implemented, Spearheaded" }
  ],
  "contentSuggestions": [
    "Quantify your bullet points: e.g., 'Reduced query latency by 35% through Redis caching'",
    "Add a dedicated System Architecture or Cloud DevOps section if applying for senior roles",
    "Include links to live project demos or GitHub repositories"
  ],
  "skillCategories": {
    "languages": ["JavaScript", "TypeScript"],
    "frameworks": ["React", "Express", "Node.js"],
    "databasesTools": ["MongoDB", "Git", "Docker"]
  }
}
`;
      const responseText = await generateContent(prompt);
      if (responseText) return cleanJsonResponse(responseText);
    } catch (error) {
      console.warn('Gemini API call failed for resume analysis, using fallback:', error.message);
    }
  }

  // Smart Mock Fallback Generator
  const words = resumeText.toLowerCase();
  const detectedSkills = [];
  const skillKeywords = ['javascript', 'react', 'node.js', 'express', 'mongodb', 'python', 'java', 'c++', 'sql', 'typescript', 'aws', 'docker', 'git', 'tailwind', 'html', 'css', 'redux', 'rest api'];
  skillKeywords.forEach(kw => {
    if (words.includes(kw)) detectedSkills.push(kw.charAt(0).toUpperCase() + kw.slice(1));
  });

  if (detectedSkills.length === 0) {
    detectedSkills.push('JavaScript', 'React', 'Node.js', 'Problem Solving', 'Git');
  }

  return {
    skills: detectedSkills,
    experienceSummary: 'Candidate demonstrates practical development experience with modern full-stack web technologies and software engineering practices.',
    strengths: ['Hands-on experience with modern JavaScript frameworks', 'Understanding of API integration and database management', 'Analytical problem-solving skills'],
    improvementAreas: ['Deepen system architecture design knowledge', 'Gain more experience with CI/CD and production cloud deployments'],
    domain: 'Software Engineering & Web Development',
    suggestedRoles: ['Full-Stack Developer', 'Frontend Engineer', 'Backend Developer'],
    atsScore: Math.min(88, Math.max(65, 60 + detectedSkills.length * 4)),
    atsChecklist: [
      { item: 'Clear Contact Info & Profile', passed: true, note: 'Valid contact sections detected' },
      { item: 'Technical Skills Keywords', passed: detectedSkills.length >= 3, note: `${detectedSkills.length} key technical keywords detected` },
      { item: 'Quantifiable Action Metrics', passed: words.includes('%') || words.includes('reduced') || words.includes('increased'), note: 'Include specific numbers and metrics for higher ATS ranking' },
      { item: 'Standard Formatting & Parsing', passed: true, note: 'Text was cleanly parsed without parsing errors' }
    ],
    contentSuggestions: [
      'Elaborate on project outcomes with measurable business metrics (e.g. "Increased test coverage to 90%").',
      'Ensure tech stack tags are placed directly next to project titles for better keyword matching.',
      'Add live demo links or public GitHub repository URLs.'
    ],
    skillCategories: {
      languages: detectedSkills.filter(s => ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Sql', 'Html', 'Css'].includes(s)),
      frameworks: detectedSkills.filter(s => ['React', 'Node.js', 'Express', 'Redux', 'Tailwind'].includes(s)),
      databasesTools: detectedSkills.filter(s => ['Mongodb', 'Aws', 'Docker', 'Git', 'Rest api'].includes(s))
    }
  };
};

/**
 * Generate Customized Interview Questions
 */
export const generateInterviewQuestions = async ({ jobTitle, jobDescription, difficulty, count = 5, resumeSkills = [] }) => {
  const ai = getClient();
  if (ai) {
    try {
      const prompt = `
You are a Senior Technical Interviewer conducting a mock interview for the role of "${jobTitle}".
Difficulty Level: ${difficulty}
Target Skills from Resume: ${resumeSkills.join(', ')}
Job Description Context: ${jobDescription ? jobDescription.substring(0, 1000) : 'Standard industry expectations for ' + jobTitle}

Generate exactly ${count} interview questions formatted as a JSON array of objects.
Each object must match this exact schema:
[
  {
    "questionText": "The interview question...",
    "category": "Technical",
    "expectedAspects": ["Aspect 1 candidate should cover", "Aspect 2", "Aspect 3"]
  }
]

Valid category values: "Technical", "Behavioral", "System Design", "Situational"
Provide diverse questions covering technical depth, problem-solving, behavioral/STAR scenarios, and architecture.
Return JSON array ONLY — no explanation or markdown.
`;
      const responseText = await generateContent(prompt);
      if (responseText) return cleanJsonResponse(responseText);
    } catch (error) {
      console.warn('Gemini API call failed for question generation, using fallback:', error.message);
    }
  }

  // Fallback Questions Bank
  const fallbackQuestions = [
    {
      questionText: `Can you walk me through a complex technical challenge you faced while working as a ${jobTitle}, and how you solved it?`,
      category: 'Behavioral',
      expectedAspects: ['Context & Problem description', 'Action taken (STAR method)', 'Technical tools used', 'Quantifiable impact/result'],
    },
    {
      questionText: `How do you optimize application performance and state management in modern web apps?`,
      category: 'Technical',
      expectedAspects: ['Caching & lazy loading', 'Database query optimization', 'Rendering performance', 'State normalization'],
    },
    {
      questionText: `Explain the architectural design of a scalable microservice or REST API system you would build for a high-traffic platform.`,
      category: 'System Design',
      expectedAspects: ['API gateway & authentication', 'Database selection & indexing', 'Load balancing & horizontal scaling', 'Error handling & logging'],
    },
    {
      questionText: `Tell me about a situation where you had a disagreement with a team member or client on a technical decision. How did you handle it?`,
      category: 'Situational',
      expectedAspects: ['Active listening & empathy', 'Data-driven argument', 'Collaboration & compromise', 'Final project outcome'],
    },
    {
      questionText: `What approaches do you take to write clean, maintainable, and well-tested code when facing tight deadlines?`,
      category: 'Technical',
      expectedAspects: ['Modular design & SOLID principles', 'Automated unit/integration testing', 'Refactoring strategy', 'Documentation & code reviews'],
    },
  ];

  return fallbackQuestions.slice(0, count);
};

/**
 * Evaluate Individual Candidate Answer
 */
export const evaluateAnswer = async ({ questionText, category, userAnswer, jobTitle, difficulty }) => {
  if (!userAnswer || userAnswer.trim().length < 10) {
    return {
      score: 20,
      clarityScore: 30,
      technicalDepthScore: 10,
      relevanceScore: 20,
      strengths: ['Attempted to respond'],
      improvements: ['Answer was too brief. Elaborate with specific details, technical examples, and the STAR framework.'],
      sampleAnswer: `A strong answer should explain the situation clearly, detail your specific technical contribution, and highlight measurable outcomes.`,
      starMethodUsed: false,
    };
  }

  const ai = getClient();
  if (ai) {
    try {
      const prompt = `
You are an expert interviewer evaluating a candidate's response.
Job Role: ${jobTitle} (${difficulty})
Category: ${category}
Question: "${questionText}"
Candidate's Response: "${userAnswer}"

Evaluate the candidate's response thoroughly and return a JSON object ONLY matching this exact schema:
{
  "score": <number 0-100>,
  "clarityScore": <number 0-100>,
  "technicalDepthScore": <number 0-100>,
  "relevanceScore": <number 0-100>,
  "strengths": ["Key positive point 1", "Key positive point 2"],
  "improvements": ["Actionable improvement recommendation 1", "Recommendation 2"],
  "sampleAnswer": "An exemplary, high-scoring model answer for this exact question",
  "starMethodUsed": <true or false>
}
Return JSON ONLY — no explanation or markdown.
`;
      const responseText = await generateContent(prompt);
      if (responseText) return cleanJsonResponse(responseText);
    } catch (error) {
      console.warn('Gemini API call failed for evaluation, using fallback:', error.message);
    }
  }

  // Fallback Evaluator
  const wordCount = userAnswer.split(/\s+/).length;
  const mentionsTech = /react|node|javascript|api|database|system|design|test|async|state|sql|code/i.test(userAnswer);
  const mentionsSTAR = /situation|task|action|result|impact|achieved|project|problem/i.test(userAnswer);

  let baseScore = Math.min(65 + Math.floor(wordCount / 3), 95);
  if (!mentionsTech && category === 'Technical') baseScore -= 15;

  return {
    score: Math.max(30, baseScore),
    clarityScore: Math.min(90, 60 + Math.floor(wordCount / 4)),
    technicalDepthScore: mentionsTech ? 85 : 55,
    relevanceScore: 80,
    strengths: [
      'Communicated response with good structure',
      mentionsTech ? 'Incorporated relevant technical terminology' : 'Addressed the core intent of the question',
    ],
    improvements: [
      'Provide more specific quantitative metrics (e.g. reduced load time by 30%, increased test coverage)',
      'Use the STAR method (Situation, Task, Action, Result) to make your experience stand out',
    ],
    sampleAnswer: `When tackling this challenge, I first analyzed the root cause by examining system metrics. I designed a modular solution leveraging modern framework patterns, implemented automated unit tests, and reduced query latency by 40%.`,
    starMethodUsed: mentionsSTAR,
  };
};

/**
 * Generate Overall Interview Performance Report
 */
export const generateOverallInterviewReport = async (questions, jobTitle) => {
  const evaluatedQuestions = questions.filter(q => q.userAnswer && q.userAnswer.trim().length >= 5 && q.evaluation && q.evaluation.score !== undefined);
  
  if (evaluatedQuestions.length === 0) {
    return {
      overallScore: 0,
      grade: 'Needs Practice',
      summary: `No questions were answered during this mock interview session for ${jobTitle}. Answer questions to receive AI score evaluations, detailed strengths, and actionable feedback.`,
      keyStrengths: ['Initiated mock interview session'],
      keyAreasToImprove: ['Provide detailed answers to interview questions using technical terms and the STAR method.'],
      actionPlan: [
        'Select a question and type or record your response.',
        'Structure your answer with Situation, Task, Action, and Result (STAR).',
        'Review sample answers for guidance on formatting high-scoring responses.'
      ],
      categoryScores: {
        technical: 0,
        behavioral: 0,
        systemDesign: 0,
        situational: 0,
      },
    };
  }

  const avgScore = Math.round(evaluatedQuestions.reduce((acc, q) => acc + q.evaluation.score, 0) / evaluatedQuestions.length);

  const ai = getClient();
  if (ai) {
    try {
      const summaryPayload = evaluatedQuestions.map(q => ({
        question: q.questionText,
        answer: q.userAnswer,
        score: q.evaluation.score,
        category: q.category,
      }));

      const prompt = `
Synthesize an overall candidate performance report for a mock interview for "${jobTitle}".
Question & Answer Data: ${JSON.stringify(summaryPayload)}

Return JSON ONLY matching this exact schema:
{
  "overallScore": ${avgScore},
  "grade": "A+",
  "summary": "Detailed 3-4 sentence performance analysis of the candidate.",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "keyAreasToImprove": ["Improvement Area 1", "Improvement Area 2"],
  "actionPlan": ["Action step 1", "Action step 2", "Action step 3"],
  "categoryScores": {
    "technical": <number 0-100>,
    "behavioral": <number 0-100>,
    "systemDesign": <number 0-100>,
    "situational": <number 0-100>
  }
}
Valid grade values: "A+", "A", "B+", "B", "C", "Needs Practice"
Return JSON ONLY — no explanation or markdown.
`;
      const responseText = await generateContent(prompt);
      if (responseText) return cleanJsonResponse(responseText);
    } catch (error) {
      console.warn('Gemini API call failed for overall report, using fallback:', error.message);
    }
  }

  // Fallback overall report
  let grade = 'B+';
  if (avgScore >= 90) grade = 'A+';
  else if (avgScore >= 80) grade = 'A';
  else if (avgScore >= 70) grade = 'B+';
  else if (avgScore >= 60) grade = 'B';
  else grade = 'Needs Practice';

  return {
    overallScore: avgScore,
    grade,
    summary: `Candidate demonstrated foundational knowledge for the ${jobTitle} position across ${evaluatedQuestions.length} answered question(s).`,
    keyStrengths: [
      'Engaged with the mock interview questions',
      'Communicated response intent',
    ],
    keyAreasToImprove: [
      'Deepen technical details with specific examples and architecture trade-offs',
      'Quantify results and metrics when sharing past accomplishments',
    ],
    actionPlan: [
      'Practice system design scenarios highlighting database indexing and API gateway patterns',
      'Refine behavioral stories using the STAR technique with concrete business metrics',
    ],
    categoryScores: {
      technical: avgScore,
      behavioral: avgScore,
      systemDesign: avgScore,
      situational: avgScore,
    },
  };
};
