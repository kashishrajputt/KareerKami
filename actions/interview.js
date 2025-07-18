"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
})

export async function generateQuiz(){
    const { userId } = await auth();
        if(!userId) throw new Error("Unauthorized");
    
        let user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
    
        if (!user) {
            user = await db.user.create({
                data: {
                    clerkUserId: userId,
                },
            });
        }

        try{

        
        const prompt = `
        Generate 10 technical interview questions for a ${
            user.industry
        } professionals ${
            user.skills?.length ? `with expertise in ${user.skills.join(", ")}`  : ""
        }.

        Each question should be multiple choice with 4 options.

        Return the response in this JSON format only, no additional text:
        {
            "questions}: [
                {
                    "question": "string",
                    "options": ["string","string","string","string"],
                    :correctAnswer": "string",
                    "explanation": "string"          
                }
            ]
        }`;
        const result = await model.generateContent(prompt)
        const response = result.response;
        const text = response.text();

        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const quiz =  JSON.parse(cleanedText);

        return quiz.questions;
    }catch(error){
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz questions");
    }
}

export async function saveQuizResult(questions, answers, score){
    const { userId } = await auth();
        if(!userId) throw new Error("Unauthorized");
    
        let user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
        });
    
        if (!user) {
            user = await db.user.create({
                data: {
                    clerkUserId: userId,
                },
            });
        }

        const questionResults = questions.map((q, index)=>({
            question: questions.question,
            answer: questionResults.correctAnswer,
            userAnswer: answers[index],
            isCorrect: questionResults.correctAnswer === answers[index],
            explanation: questionResults.explanation,
        }));

        const wrongAnswers = questionResults.filter((q)=>!q.isCorrect);
        let improvementTip = null;

        if(wrongAnswers.length >0){
            const wrongQuestionsText = wrongAnswers
            .map(
                (q) => 
                    `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
            )
            .join("\n\n");

            const improvementPrompt = `
            The user got following ${user.industry} technical interview questions wrong:
            
            ${wrongQuestionsText}
            Based on these mistakes, provide a concise, specific improvement tip.
            Focus on the knowledge gaps revealed by these wrong answers.
            Keep the response under 2 sentences and make it encouraging.
            Focus on what to learn/practice based on the wrong answers given.

            `;
            try{
                const result = await model.generateContent(improvementPrompt)
                const response = result.response;
                const improvementTip = response.text().trim();

            }catch(error){
                console.error("Error generating improvement tip:", error);
            }
        }

        try{
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
        }catch(error){
            console.error("Error saving quiz result:", error);
            throw new Error("Failed to save quiz result");

        }

}