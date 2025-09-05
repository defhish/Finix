import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "finix", name:"Finix",
    //retry if something goes wrong
    retryFunction:async (attempt)=>({
        delay: Math.pow(2,attempt)*1000, //exponential backoff
        maxAttempts:2,
    })
 });