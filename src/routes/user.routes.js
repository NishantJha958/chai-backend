import { Router } from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js"
//import upload from multer
import { upload } from "../middlewares/multer.middleware.js"
//now how to use this upload,so middleware is jate hue mujhse milke jana
//therefore we will add middleware just before the registerUser function,that is:
//uplaod.fields()

const router = Router()

//how to write a route and use a middleware
router.route("/register").post(upload.fields(
    [
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]
),
    registerUser)
// Note: The base route is declared in app.js as "/api/v1/users".
// So the correct URL is: POST http://localhost:8000/api/v1/users/register

router.route("/login").post(loginUser)
//kuch routes dene h jb user login ho for verification by auth middleware
//secired routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
export default router