//ye sirf verify krega ki user h ya nhi h
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

//Authorization: Bearer <token>
//jab user ko login krwaya tb user ko AT & RT de diye and uske basis pe verify kiya
export const verifyJWT = asyncHandler(async (req, res, next) => {
    //token ka access kaise lenge-->req ke paas cookies ka access h by cookieParser

    //token acces 
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        //decode the token for user details
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiError(401, "Invalid Token")
        }
        //find user in DB
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid Token")
        }

        req.user = user;//why do we add this,bcoz jb user login hoga tb hme uski details chahiye ,to isi ko store kr lenge req.user me
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token")
    }
    //ab middleware use kaise ayenge,mostly in routes
})