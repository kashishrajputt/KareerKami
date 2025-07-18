"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";
import { revalidatePath } from "next/cache";


export async function updateUser(data){
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

    try {

        const result = await db.$transaction(
            async(tx) => {
         //find if the industry exists
         let industryInsight = await tx.industryInsight.findUnique({
            where:{
                industry: data.industry,
            },
         });
        // if industry doesnt exit, create it with default values - will replace
        // it with ai later
        if(!industryInsight){
            const insights = await generateAIInsights(data.industry);
                       
                    industryInsight = await db.industryInsight.create({
                        data: {
                            industry: data.industry,
                            ...insights,
                            nextUpdate: new Date(Date.now() + 7*24 * 60 * 60 * 1000)
                        },
                    });
                       
        }
        // update the user
        const updatedUser = await tx.user.update({
            where: {
                id: user.id,
            },
            data:{
                industry: data.industry,
                experience: data.experience,
                bio: data.bio,
                skills: data.skills,
            },
        });

        return { updatedUser, industryInsight };
        },
        {
            timeout: 10000, //default: 5000
        });
        revalidatePath("/");
        return result.user;

    } catch(error){
        console.error("Error updating user and industry:", error.message);
        throw new Error(`Failed to update profile: ${error.message}`);
    }
}

export async function getUserOnboardingStatus(){
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

    
        return {
                isOnboarded: !!user?.industry,
        };
        

} 
