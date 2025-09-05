import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import arcjet, {createMiddleware, detectBot, shield} from "@arcjet/next"
//createRouteMatcher creates a function that checks if a given path matches a certain route
const isProtectedRoute=createRouteMatcher([
    "/dashboard(.*)", //dashboard page and whatever comes after /dashboard/xyz and so on
    "/account(.*)",
    "/transation(.*)",
])

const aj= arcjet({
  key:process.env.ARCJET_KEY,
  rules:[
    shield({
      mode:"LIVE",
    }),
    detectBot({
      mode:"LIVE",
      allow:[
        //hover on the empty quotes you will see a bunch of bots
        "CATEGORY:SEARCH_ENGINE",  //allows our website to show up on the search engine search
        "GO_HTTP" //allows inggest to work with our app
      ], 
    })
  ]
});

const clerk= clerkMiddleware(async(auth,req)=>{
    const { userId }= await auth();

    //if there is no userId and is in a protected route then:
    if(!userId && isProtectedRoute(req)){
      const { redirectToSignIn }= await auth();
      return redirectToSignIn({ returnBackUrl: req.url }); //take user to signin page if not signed in, and after bring back to the page they were originally headed to
    }
});

export default createMiddleware(aj,clerk); //first protect website then user protection/auth

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};