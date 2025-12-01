"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local and restart the server.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a stable, guaranteed-available model
const MODEL_NAME = "gemini-1.5-flash-latest"; 

export const generateAIInsights = async (industry) => {
  if (!industry) throw new Error("No industry provided to generateAIInsights.");

  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }

    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
  `;

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const result = await model.generateContent(prompt);
  const response = result.response;

  let text = "";

  if (typeof response.text === "function") {
    text = await response.text();
  } else {
    text = String(response.text ?? "");
  }

  const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      "Failed to parse JSON from model response: " +
      err.message +
      " — response snapshot: " +
      cleaned.slice(0, 1000)
    );
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
