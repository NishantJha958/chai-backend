import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
//configuration  
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))//when data comes from form

app.use(express.urlencoded({ extended: true, limit: "16kb" }))//when data comes from url

app.use(express.static("public"))//when we want to keep some files static to store the image and other files data

//use of cookie parser is to access and edit cookies of the browser

app.use(cookieParser())

export { app }