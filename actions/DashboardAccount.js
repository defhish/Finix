"use server"; //write to tell that this is server side 
//this is backend logic for account creation
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


// THIS IS THE LOGIC TO CREATE AN ACCOUNT

const serializeAmount = (obj) => {
    const serialize = { ...obj };
  
    if (obj.balance) {
      serialize.balance = obj.balance.toNumber();
    }
    if (obj.amount) {
      serialize.amount = obj.amount.toNumber();
    }
  
    return serialize;
  };
  

export async function createAccount(data){
    //name, type, balance and isDefault are the things that will coming from the data parameter.
    try{
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

        //convert balance to float before saving
        const balanceFloat= parseFloat(data.balance);
        if(isNaN(balanceFloat)){//NaN means not a number, so we are checking whether the input value is actually a number or not
            throw new Error("Invalid balance amount")
        }
        
        //now we want to check whether this is the first account the user is creating, if yes then it will be made default account
        const existingAccount= await db.account.findMany({
            where: {userId:user.id},
        });

        const shouldbeDefault=existingAccount.length===0?true:data.isDefault;  //if exisitng accounts length is 0, meaning this is the first account then make the account being created as default, else take the value provided in data(the parameter used in this function) isDefault to be the value

        //if new account is made default then any other account that was default should be made non default
        if(shouldbeDefault){
            await db.account.updateMany({
                where: { userId: user.id, isDefault: true }, //find whichever old account was default
                data: { isDefault: false }                   // make it false
            });
        }

        const account=await db.account.create({
            data:{
                ...data, //data provided by the user
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldbeDefault,
            },
        });

        //next.js does not support float values, so we cant return account as it contains balance as float value, so we need to serialize it before returning, so we create a function

        const serializeAccount=serializeAmount(account);
        revalidatePath("/dashboard");  //this helps in refetching the values of a page, so after creating a new account the values of the page will be fetched again
        return { success:true, data: serializeAccount };

    } catch(error){error.message}
}

//FETCH USER ACCOUNTS LOGIC/SERVER SIDE LOGIC

export async function FetchUserAccounts(){
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

        const accounts=await db.account.findMany({
            where:{userId:user.id},
            orderBy:{createdAt: "desc"},
            include:{
                _count:{
                    select:{
                        transactions:true,
                    }
                }
            }
        })
        //since the above is an array, we will map and then serialize it
    // const serializeAccount=serializeAmount(accounts); wont work

    const serializeAccount=accounts.map(serializeAmount)
    return serializeAccount;
}

export async function getDashBoardData(){
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
    
    //get all user transactions
    const transactions= await db.transaction.findMany({
        where:{userId:user.id},
        orderBy:{date:"desc"},
    });

    return transactions.map(serializeAmount)
}