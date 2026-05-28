import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import express from "express"

const connectDB = async () => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGODB CONNECTED HOST: ${connectInstance.connection.host}`)
    }
    catch (error) {
        console.log("MONGODB CONNECTION ERROR ", error)
        process.exit(1);
    }
}

export default connectDB;