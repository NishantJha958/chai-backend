//require('dotenv').config({path:'./env'})  OR import dotenv from 'dotenv'; dotenv.config();
import connectDB from "./db/index.js";
import dotenv from "dotenv";

/* approach 1
import express from "express"
const app = express()

    (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on("error", (error) => {
                console.error("ERROR", error)
                throw error
            })
            app.listen(process.env.PORT, () => {
                console.log(`App is running on port ${process.env.PORT}`)
            })
        }
        catch (error) {
            console.error("ERROR", error)
            throw err;
        }
    })()
*/

// approach 2
dotenv.config({ path: './.env' })
connectDB();