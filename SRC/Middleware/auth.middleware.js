// auth middleware 
import jwt from "jsonwebtoken";
import User from "../../DB/Models/user.model.js";
import { errorHandlerClass } from "../utils/error-class.utils.js";

export const auth = () => {
    return async(req,res,next) => {
    console.log("auth");
        const {token} = req.headers;
        if(!token){
            return res.status(400).json({message:"unauthenticated , Please signIn first"})
        }

        if (!token.startsWith("resApp")){
            //return res.status(400).json({message:"Invalid Token"})
            return next(new errorHandlerClass('Invalid Token',401,'Invalid Token'));
        }

        const originalToken=token.split(" ")[1];
        const decodedData =jwt.verify(originalToken,"accessTokenSignature");
        if(!decodedData?._id){
            return next(new errorHandlerClass('Invalid Token Payload',400,'Invalid Token Payload'));
        }

        const user=await User.findById(decodedData._id).select("-password")
        if(!user){
            return next(new errorHandlerClass('Please signUp',400,'Please signUp'));
        }
        req.authUser=user
        next()
    }
}                   