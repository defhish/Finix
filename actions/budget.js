"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
    try {
        const { userId }=await auth();
        if(!userId) throw new Error("Unauthorized User")

        
        //check if user is in database
        const user=await db.user.findUnique({
            where:{clerkUserId: userId},
        })
        //if not send error
        if(!user){
            throw new Error("User Not Found")
        }

        const budget=await db.budget.findFirst({
            where:{
                userId:user.id,
            }
        })

        const currentDate=new Date();
        const startOfMonth=new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );

        const endOfMonth=new Date(
            currentDate.getFullYear(),
            currentDate.getMonth()+1,
            0
        );
        const expenses=await db.transaction.aggregate({
            where:{
                userId:user.id,
                type: "DEBIT",
                date:{
                    gte:startOfMonth,
                    lte:endOfMonth,
                },
                accountId,
            },
            _sum:{
                amount:true
            }
        })

        return{
            //what ever is inside budget ...budget, add amount to it after serializing it
            budget: budget?{...budget, amount:budget.amount.toNumber()}:null,
            //calculate the sum of all expenses then serialize it to a number and return it
            currentExpenses: expenses._sum.amount?expenses._sum.amount.toNumber():0,
        }

    } catch (error) {
        console.error("Error fetchhing budget", error);
        throw error;
    }
}


export async function updateBudget(amount){
    try {
        const { userId }=await auth();
        if(!userId) throw new Error("Unauthorized User")

        const user=await db.user.findUnique({
            where:{clerkUserId: userId},
        })
        if(!user) throw new Error("User Not Found")

        //if budget doesnt exist then we create it else we update it

        const budget=await db.budget.upsert({
            //find user
            where:{
                userId:user.id,
            },
            //update if budget exists
            update:{
                amount,
            },
            //else create it
            create:{
                userId:user.id,
                amount,
            }
        })

        revalidatePath("/dashboard")
        return{
            success: true,
            data: {...budget, amount:budget.amount.toNumber()},
        }
        
    }
    catch (error) {
        console.error("Error updating budget", error);
        return{
            success: false,
            message: error.message,
        }
    }
}