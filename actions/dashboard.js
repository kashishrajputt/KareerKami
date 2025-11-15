"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Add it to .env.local and restart the server.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Preferred model names (will try to match available models)
const PREFERRED_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5",
  "gemini-1.0",
  "text-bison@001",
  "chat-bison@001",
];

async function chooseModelName() {
  const list = await genAI.listModels();
  const models = list?.models ?? [];

  // Try exact or partial match from preferred list
  for (const pref of PREFERRED_MODELS) {
    const match = models.find((m) => m.name === pref || m.name?.includes(pref));
    if (match) {
      // If SDK provides supportedMethods, prefer models that support generateContent
      if (!match.supportedMethods || match.supportedMethods.includes("generateContent")) {
        return match.name;
      }
    }
  }

  // fallback: pick first model that advertises generateContent support
  const genContentModel = models.find((m) => m.supportedMethods?.includes("generateContent"));
  if (genContentModel) return genContentModel.name;

  // otherwise surface available models for diagnostics
  const available = models.map((m) => m.name).slice(0, 50).join(", ");
  throw new Error(
    `No suitable generative model found for generateContent. Available models (sample): ${available}`
  );
}

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

  const modelName = await chooseModelName();
  const generativeModel = genAI.getGenerativeModel({ model: modelName });

  try {
    const result = await generativeModel.generateContent(prompt);
    const response = result?.response;

    // response.text may be a function, a promise, or a string
    let text = "";
    if (!response) throw new Error("Empty response object from model.generateContent()");
    if (typeof response.text === "function") {
      const maybeText = response.text();
      text = maybeText instanceof Promise ? await maybeText : String(maybeText || "");
    } else {
      text = String(response.text ?? "");
    }

    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error(
        "Failed to parse JSON from model response: " +
          parseErr.message +
          " — response snapshot: " +
          cleaned.slice(0, 1000)
      );
    }
  } catch (err) {
    // If model name isn't supported for generateContent you'll see a 404 / not found error;
    // surface a helpful message including modelName so you can inspect available models.
    const msg = String(err?.message || err);
    if (/not found|404|is not found|supported for generateContent/i.test(msg)) {
      throw new Error(
        `Model "${modelName}" is not available for generateContent with this API/version. Run listModels() to see available models or check your Google Cloud permissions. Original error: ${msg}`
      );
    }
    throw err;
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