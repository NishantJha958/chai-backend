import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
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
        field?.trim === "")) {
        throw new apiError(400, "All fields are required")
    }//validation ho gya now will check if the user already exists
    //DB user check:1) import user from user.models.js 2)the User from the user.models.js can contact with he DB directly 3)so User hi aapke behalf pe call krega to the DB
    const existedUser = UserActivation.findOne({
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
        throw new apiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))

})


export { registerUser, }
//method toh bana diya,but ye run kab hoga,jab koi na koi url hit ho
//toh for that we will write the ROUTE
