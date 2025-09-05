import arcjet, { tokenBucket } from "@arcjet/next"

const aj=arcjet({
    key: process.env.ARCJET_KEY,
    characteristics:["userId"], //track based on Clerk userId 
    rules:[
        tokenBucket({ //tokenBucket is used for rate limiting
             mode:"LIVE",
             refillRate:15,
             interval:3600, //hourly
             capacity:15,
        })
        //so user has the capacity to make 15 requests, and after every 3600seconds, or 1 hour the bucket gets refilled by 15
    ]
})

export default aj;