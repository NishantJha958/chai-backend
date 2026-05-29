import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; //fs is the file system,to read write remove the files,we need the files's path using fs

//configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//upload file to cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload the file to the cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"//image,audio,video,etc
        })
        console.log("file is uploaded on cloudinary", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file
        return null;
    }
}

export { uploadOnCloudinary };