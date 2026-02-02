import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";


// Helper: Convert a Resume mongoose document into rich plain text
// that the AI can understand and evaluate like a recruiter/ATS.
const resumeToPlainText = (resume) => {
  const lines = [];

  lines.push(`Resume Title: ${resume.title || "Untitled Resume"}`);

  if (resume.personal_info) {
    const p = resume.personal_info;
    lines.push("\n[PERSONAL INFO]");
    lines.push(`Name: ${p.full_name || ""}`);
    lines.push(`Profession / Headline: ${p.profession || ""}`);
    lines.push(`Email: ${p.email || ""}`);
    lines.push(`Phone: ${p.phone || ""}`);
    lines.push(`Location: ${p.location || ""}`);
    lines.push(`LinkedIn: ${p.linkedin || ""}`);
    lines.push(`Website: ${p.website || ""}`);
  }

  if (resume.professional_summary) {
    lines.push("\n[PROFESSIONAL SUMMARY]");
    lines.push(resume.professional_summary);
  }

  if (Array.isArray(resume.skills) && resume.skills.length > 0) {
    lines.push("\n[SKILLS]");
    lines.push(resume.skills.join(", "));
  }

  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    lines.push("\n[EXPERIENCE]");
    resume.experience.forEach((exp, idx) => {
      lines.push(`\nRole ${idx + 1}: ${exp.position || ""} at ${exp.company || ""}`);
      lines.push(
        `Dates: ${exp.start_date || "N/A"} - ${
          exp.is_current ? "Present" : exp.end_date || "N/A"
        }`
      );
      if (exp.description) {
        lines.push("Description:");
        lines.push(exp.description);
      }
    });
  }

  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    lines.push("\n[PROJECTS]");
    resume.projects.forEach((proj, idx) => {
      lines.push(`\nProject ${idx + 1}: ${proj.name || ""}`);
      lines.push(`Type: ${proj.type || ""}`);
      if (proj.description) {
        lines.push("Description:");
        lines.push(proj.description);
      }
    });
  }

  if (Array.isArray(resume.education) && resume.education.length > 0) {
    lines.push("\n[EDUCATION]");
    resume.education.forEach((edu, idx) => {
      lines.push(`\nEducation ${idx + 1}: ${edu.degree || ""} in ${edu.field || ""}`);
      lines.push(`Institution: ${edu.institution || ""}`);
      lines.push(`Graduation Date: ${edu.graduation_date || ""}`);
      if (edu.gpa) {
        lines.push(`GPA: ${edu.gpa}`);
      }
    });
  }

  return lines.join("\n");
};

// controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({
                message: "Missing required fields (userContent)",
            });
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content:
                        "Your are an expert in resume writing. Your task is to enhance to professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly and only return text no options or anything else.",
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
        });

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({
            enhancedContent,
        });
    } catch (error) {
        console.error("AI Summary Enhancement Error:", error);
        return res.status(500).json({
            message: "Failed to enhance summary via AI.",
            error: error.message,
        });
    }
}


// controller for enhancing a resume's job description
// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
    try {
        const { promptContent } = req.body;

        if (!promptContent) {
            return res.status(400).json({
                message: "Missing required fields (promptContent)",
            });
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content:
                        "Your are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only 1-2 sentence also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly and only return text no options or anything else.",
                },
                {
                    role: "user",
                    content: promptContent,
                },
            ],
        });

        const enhancedContent = response.choices[0].message.content;

        return res.status(200).json({
            enhancedContent,
        });
    } catch (error) {
        console.error("AI Job Description Enhancement Error:", error);
        return res.status(500).json({
            message: "Failed to enhance job description via AI.",
            error: error.message,
        });
    }
};


// controller for uploading a resume to the database
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try {
        const { resumeText, title } = req.body;

        const userId = req.userId; // Assumes userId is injected by middleware

        if (!resumeText) {
            return res.status(400).json({
                message: "Missing required fields (resumeText)",
            });
        }

        const systemPrompt = "You are an expert AI agent to extract data from resume.";

        const userPrompt = `extract data from this resume: ${resumeText}
    
    Provide data in the following JSON format with no additional text before or after, using the following schema keys:
    
    {
    "professional_summary": "",
    "skills": ["skill1", "skill2"],
    "personal_info": {
      "image": "",
      "full_name": "",
      "professional": "",
      "email": "",
      "phone": "",
      "location": "",
      "linkedin": "",
      "website": ""
    },
    "experience": [
      {
        "company": "",
        "position": "",
        "start_date": "YYYY-MM",
        "end_date": "YYYY-MM" (or null if is_current is true),
        "description": "",
        "is_current": true/false
      }
    ],
    "projects": [
      {
        "name": "",
        "type": "",
        "description": ""
      }
    ],
    "education": [
      {
        "institution": "",
        "degree": "",
        "field": "",
        "graduation_date": "YYYY-MM",
        "gpa": ""
      }
    ]
    }
    `;

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            response_format: { type: "json_object" },
        });

        const extractedData = response.choices[0].message.content;

        const parsedData = JSON.parse(extractedData);

        const newResume = await Resume.create({ userId, title, ...parsedData });

        return res.status(200).json({
            resumeId: newResume._id,
        });
    } catch (error) {
        console.error("AI Resume Upload/Parse Error:", error);
        return res.status(500).json({
            message: "Failed to parse and upload resume via AI.",
            error: error.message,
        });
    }
};


// Analyze a resume with AI
// POST: /api/ai/analyze-resume
export const analyzeResume = async (req, res) => {
  try{
    const userId = req.userId;
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        message: "Missing required fields (resumeId)",
      });
    }

    const resume = await Resume.findOne({ _id: resumeId, userId });

    if (!resume) {
      return res.status(404).json({
        message: "Resume Not Found or Unauthorized.",
      });
    }

    const resumeText = resumeToPlainText(resume);

    const systemPrompt = `
You are an advanced Applicant Tracking System (ATS) and senior technical recruiter specializing in software and technology roles (frontend, backend, full-stack, DevOps, data, product-adjacent engineering).

Your job is to:

1. Evaluate the resume for ATS compatibility and technical hiring quality.
2. Give a realistic ATS compatibility score from 0-100.
   - 90-100: Exceptional, highly optimized for tech roles.
   - 75-89: Strong, competitive but can be sharpened.
   - 50-74: Average, will likely be filtered without improvement.
   - Below 50: Weak, at high risk of rejection.
3. Identify **strengths** in clarity, structure, skills, impact, and seniority signal.
4. Identify **weaknesses**, especially:
   - Vague or generic statements without measurable impact.
   - Responsibilities that sound like tasks, not outcomes.
   - Overuse of buzzwords with no proof.
   - Missing context (team size, scale, stack, metrics).
5. Suggest **missing but relevant keywords** for modern software/tech roles, including:
   - Programming languages, frameworks, tools.
   - Cloud, DevOps, data tooling where appropriate.
   - Domain-specific terms relevant to the experience.
6. Provide **section-wise feedback** specifically for:
   - summary
   - experience
   - projects
   - skills
7. Suggest **specific, actionable improvements**, including:
   - How to rewrite vague lines with quantifiable achievements.
   - Where to add metrics (% improvement, revenue impact, performance gains).
   - How to better align with modern job descriptions for tech roles.

CRITICAL:
- Optimize for Applicant Tracking Systems (ATS) and real recruiter screening.
- Avoid generic advice; make suggestions grounded in the actual resume content.
- When you suggest keywords or improvements, they MUST be realistically supportable based on the candidate's background (no fake technologies or roles).
- Be concise but concrete, like advice you'd give a candidate preparing for a real Big Tech or startup interview pipeline.

Return ONLY a valid JSON object in the following structure (no explanations, no markdown, no extra text):

{
  "atsScore": number,
  "strengths": string[],
  "weaknesses": string[],
  "missingKeywords": string[],
  "sectionFeedback": {
    "summary": string,
    "experience": string,
    "projects": string,
    "skills": string
  },
  "suggestions": string[]
}
    `.trim();

    const userPrompt = `
Analyze the following resume for software/tech roles.

Focus on:
- ATS compatibility.
- Technical depth and credibility.
- Clear, impact-oriented experience.
- Modern, industry-relevant keywords.

Here is the resume content:

${resumeText}
    `.trim();

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2500,
    });

    const raw = response.choices[0].message.content;
    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch (parseError) {
      console.error("Failed to parse AI analysis JSON:", parseError, raw);
      return res.status(500).json({
        message: "AI returned an invalid analysis format.",
      });
    }

    // Basic shape validation (defensive)
    if (
      typeof analysis.atsScore !== "number" ||
      !analysis.sectionFeedback ||
      typeof analysis.sectionFeedback.summary !== "string"
    ) {
      console.error("AI analysis JSON shape is invalid:", analysis);
      return res.status(500).json({
        message: "AI returned an incomplete analysis.",
      });
    }

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error("AI Resume Analysis Error:", error);
    return res.status(500).json({
      message: "Failed to analyze resume via AI.",
      error: error.message,
    });
  }
};