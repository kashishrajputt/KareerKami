"use server";

export async function updateUser(data){
    const { userId } = await auth();
    if(!userId) throw new Error("Unauthorized");

    const user = await db.userfindUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) throw new Error("User not found");

    try {

        const result = await db.$transaction(
            async() => {
         //find if the industry exists
         let industryInsights = await tX.industryInsight.findUnique({
            where:{
                industry: data.industry,
            },
         })
        // if industry doesnt exit, create it with default values - will replace
        // it with ai later
        if(!industryInsight)
        // update the user
        },
        {
            timeout: 10000, //default: 5000
        });

        return result.user;

    } catch(error){
console.error("Error updating user and industry:", error.message);
throw new Error("Failed to update profile")
    }
}