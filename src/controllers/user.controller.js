import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

//AT & RT are for user,so that he dont have to fill login form again and again
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()//after we get our AT & RT ,AT goes to the user but the RT needs to be save in the DB,so how to save the RT in the DB
        user.refreshToken = refreshToken;//adding to the user's object(refreshToken),it's value
        await user.save({ validateBeforeSave: false })//use validateBeforeSave as false so that we can save the user without password or refresh token,this tsep was to put the RT in the DB

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}
//user registration controller steps:
//get name,email,password,image from frontend
//validate (check correct format,check if empty or all possible validations)it in the backend
//check user exist or not in DB(check by email or username)
//check for images,check for avatars,if available send them to clodinary
//check/uplaod avatar in cloudinary
//create user object coz using mongoDB-create entry in DB
//remove password and refresh token field from response
//check for user creation,and then return response
//so basically this is the algorithm from the DSA
//also we have to handle file,so will got to routes
//import upload from multer to routes

const registerUser = asyncHandler(async (req, res) => {
    //user details kaise lein-->we will get it in "req.body" and by destructure,agar body and json se aa rha toh req.body se mil jaega,but can also come from url
    const { fullName, username, email, password } = req.body
    console.log("email:", email);//user ki details aa gyi ab krna h validation,ek ek field ko check krenge if empty or not
    //validations(can check by if else too)
    if ([fullName, username, email, password].some((field) =>
        field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }//validation ho gya now will check if the user already exists
    //DB user check:1) import user from user.models.js 2)the User from the user.models.js can contact with he DB directly 3)so User hi aapke behalf pe call krega to the DB
    const existedUser = await User.findOne({
        $or: [{ username }, { email }] //by using '$or' operator we can many queries in the .find() or .findOne() function
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }//user check ho gya,now images or avatars
    //what we know is req.body ke ander sara data aata h,now since we have a routes middleware,so we can more fields in the "req"
    //multer has uploaded the path of the file in the destination(refer multer.middleware.js)
    //.path function gives the path which the multer has already added in the server,also use optional() so that if any file is not uploaded,it doesn't throw an error
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    //check if we have the avatar image
    if (!avatarLocalPath) { throw new ApiError(400, "Avatar file is required") }
    //now will upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //check the avatar,hai ya nhi
    if (!avatar) throw new ApiError(400, "Avatar file is required")
    //now create user object and entry in DB
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })//now check for user creation

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))

})

//login controller
const loginUser = asyncHandler(async (req, res) => {
    //req.body se data le aao || validate by email or username
    //find the user and check password || generate AT and RT 
    //send AT AND RT by cookies , then reponse
    const { username, email, password } = req.body//data lana
    if (!username || !email) { throw new ApiError(400, "Username or email both are required") }//validation of the fields
    const user = await User.findOne({
        $or: [{ username }, { email }]//check of user existense
    })  // user is present then it will return the user object
    if (!user) {
        throw new ApiError(404, "user is not found")
    }//agar user nhi mila
    //now password check if user mil gaya
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }
    //password check ho gya,now AT & RT
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    //send by cookies,user ko kya kya info bhejni h
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //jab bhi cookies bhejte h kuch options(object design krne pdte hain)
    const options = {
        httpOnly: true,
        secure: true   //isse kya hota h ki ,this cookie can only be modified in the server not by the frontend
    }
    //response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                }, "User logged in successfully"))
})
//logout controller
const logoutUser = asyncHandler(async (req, _, next) => {
    //clear all the cookies and also AT & RT,but user kahan se leke aaun,we will do it by designing custom middleware
    //logout user
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )
        const options = {
            httpOnly: true,
            secure: true   //isse kya hota h ki ,this cookie can only be modified in the server not by the frontend
        }
        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"))
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while logging out")
    }





})

//ek endpoint banaenge where on hit ,we will refresh the access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    //ye refresh kaise krwa paega,aapko mujhe refresh token bhejna hi pdega,how we will get it---> by cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }
    //verify incoming token by jwt
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        //we can not get the user info from the MongoDb query
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid Refresh Token")
        }
        //now will send the new AT & RT by cookies
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(new ApiResponse(200, { accessToken, newrefreshToken }, "Access token refreshed successfully"))


    }
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})
//update controller




export { registerUser, loginUser, logoutUser, refreshAccessToken }
//method toh bana diya,but ye run kab hoga,jab koi na koi url hit ho
//toh for that we will write the ROUTE
