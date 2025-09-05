import { seedTransactions } from "@/actions/seed";

export async function GET() { //get happens when a webpage is opened, browswer makes a get request to get the content of the webpage from the server
    //basically used to retrieve data from a server
    const result=await seedTransactions()
    return Response.json(result);
    //in response of the get request, RESPONSE.JSON(result) will serialize result into json format and returns it
}

//so when we visit this route, the database will get populated with the results we get from the seedTransaction server action
