"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Initialize Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite"
});

// ======================================================
// ✅ Generate Quiz
// ======================================================
export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true }
  });

  if (!user) throw new Error("User not found");

  const prompt = `
Generate exactly 10 technical interview MCQs for a ${user.industry} professional 
${user.skills?.length ? `with expertise in: ${user.skills.join(", ")}` : ""}.

Each question must include:
- "question": string  
- "options": [4 strings]  
- "correctAnswer": string  
- "explanation": string  

STRICT OUTPUT RULES:
- Output **ONLY valid JSON**
- No markdown
- No comments
- No extra text outside JSON
- No trailing commas

Format:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": ""
    }
  ]
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const raw = result.response.text();
    const quiz = JSON.parse(raw);

    if (!quiz?.questions) {
      throw new Error("Invalid quiz format returned");
    }

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

// ======================================================
// ✅ Save Quiz Result
// ======================================================
export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, i) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[i],
    isCorrect: q.correctAnswer === answers[i],
    explanation: q.explanation
  }));

  const wrongAnswers = questionResults.filter(q => !q.isCorrect);

  // ======================================================
  // Generate improvement tip (only if needed)
  // ======================================================
  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsString = wrongAnswers
      .map(q => 
        `Question: "${q.question}"
Correct Answer: "${q.answer}"
User Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
The user answered these ${user.industry} questions incorrectly:

${wrongQuestionsString}

Based on this, generate ONE short improvement tip (max 2 sentences).
Focus on what the user should study or practice next.
Do NOT mention the wrong answers directly.
Keep it encouraging.
`;

    try {
      const tipResult = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: improvementPrompt }] }]
      });

      improvementTip = tipResult.response.text().trim();
    } catch (err) {
      console.error("Error generating improvement tip:", err);
      improvementTip = null; // continue without tip
    }
  }

  // ======================================================
  // Save assessment to database
  // ======================================================
  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip
      }
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

// ======================================================
// ✅ Get All Assessments
// ======================================================
export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user) throw new Error("User not found");

  try {
    return await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" }
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
