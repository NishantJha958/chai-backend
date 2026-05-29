import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
//configuration ,but what is this configuration for?
//we are telling the browser that this server is allowed to send request to this server and receive response from this server and what kind of request and response it is allowed to send and receive
//
//what is origin
//origin is the domain name of the server that is allowed to send request to this server and receive response from this server and what kind of request and response it is allowed to send and receive
//cors is a middleware that is used to handle the cross-origin resource sharing
//what is cross-origin resource sharing
//cross-origin resource sharing is a security feature that is used to prevent the cross-origin resource sharing and what kind of request and response it is allowed to send and receive
//what is the security feature
//security feature is a feature that is used to prevent the cross-origin resource sharing and what kind of request and response it is allowed to send and receive
//The file app.js serves as the central configuration hub for your Express application. It sets up the core middleware, security options, and request parsers that process incoming HTTP requests before they reach your API routes
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))//when data comes from form 

app.use(express.urlencoded({ extended: true, limit: "16kb" }))//when data comes from url

app.use(express.static("public"))//when we want to keep some files static to store the image and other files data

//use of cookie parser is to access and edit cookies of the browser
// Enables the server to read and write cookies from/to the client's browser.
//Without this, reading incoming cookies is difficult. With cookieParser, the client's cookies are parsed and populated in req.cookies (or req.signedCookies if signed). You can also set cookies on the client's browser using res.cookie(). This is highly useful for secure, HTTP-only cookie authentication flows
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'

//routes declaration:since routers and controllers are in separate files,we will have to use middlewares to bring them here
app.use("/api/v1/users", userRouter)//when clicked on /user url,it goes into userRouter.js and gets what to do

//http://localhost:8000/api/v1/users/register

export default app