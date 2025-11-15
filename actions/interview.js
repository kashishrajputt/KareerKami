"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

async function callLLM(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Interview Quiz App",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`LLM request failed (${response.status}): ${text}`);
  }

  const json = await response.json().catch(() => null);
  return json?.choices?.[0]?.message?.content ?? "";
}

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    user = await db.user.create({ data: { clerkUserId: userId } });
  }

  try {
    const prompt = `
        Generate 10 technical multiple-choice interview questions for a ${user.industry || "general"} professional${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""}.

        Each question should have 4 options. Return the response in this JSON format only (no additional text):

        {
        "questions": [
            {
            "question": "string",
            "options": ["string","string","string","string"],
            "correctAnswer": "string",
            "explanation": "string"
            }
        ]
        }
        `;

    const raw = await callLLM(prompt);
    const cleaned = String(raw).replace(/```(?:json)?\n?/g, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error("Failed to parse quiz JSON from LLM response: " + parseErr.message + " — response snapshot: " + cleaned.slice(0, 1000));
    }

    if (!quiz?.questions || !Array.isArray(quiz.questions)) {
      throw new Error("LLM returned invalid quiz format: missing questions array");
    }

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    user = await db.user.create({ data: { clerkUserId: userId } });
  }

  if (!Array.isArray(questions) || !Array.isArray(answers)) {
    throw new Error("Invalid input: questions and answers must be arrays");
  }

  const questionResults = questions.map((q, index) => {
    const correct = q?.correctAnswer ?? null;
    const userAnswer = answers[index] ?? null;
    return {
      question: q?.question ?? "",
      answer: correct,
      userAnswer,
      isCorrect: correct !== null ? correct === userAnswer : false,
      explanation: q?.explanation ?? "",
    };
  });

  const wrongAnswers = questionResults.filter((r) => !r.isCorrect);

  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
        The user got the following ${user.industry || "general"} technical questions wrong:

        ${wrongQuestionsText}

        Based on these mistakes, provide a concise, specific improvement tip (what to study/practice). Keep it under 2 sentences and encouraging.
        Return only the tip as plain text.
        `;

    try {
      const tipRaw = await callLLM(improvementPrompt);
      improvementTip = String(tipRaw || "").trim();
    } catch (err) {
      console.error("Error generating improvement tip:", err);
      improvementTip = null;
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}