import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";
//"@clerk/nextjs/dist/types/server" change this to "@clerk/nextjs/server"
export const checkUser=async()=>{

    const user=await currentUser(); //take the detail of the currentuser, it is a currentUser() is a function of clerk

    if(!user){
        return null; //if no user then return null
    }

    //now we check if we have the user on our database
    try{
        const loggedUser= await db.user.findUnique({
            where:{ //check whether the user's id is in the 'User' database
                clerkUserId: user.id,
            },
        });

        //if user exists then return the user
        if(loggedUser){
            return loggedUser;
        }

        //else create the new user in the database
        const name=`${user.firstName} ${user.lastName}`;

        const newuser=await db.user.create({
            data:{ //all these user.id, user.imageUrl etc are clerk functions.
                clerkUserId: user.id,
                name,
                imageUrl:user.imageUrl,
                email:user.emailAddresses[0].emailAddress,
            },
        });
    } catch(error){
        console.log(error.message)
    }   
}