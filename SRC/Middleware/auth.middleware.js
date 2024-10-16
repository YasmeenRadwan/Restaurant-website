// auth middleware 
import User from "../../DB/Models/user.model.js";
import { errorHandlerClass } from "../utils/error-class.utils.js";
import { verifyJWT } from "../utils/jwt.utils.js";

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
        const decodedData =verifyJWT(originalToken);
        console.log(decodedData);
        if(!decodedData?._id){
            return next(new errorHandlerClass('Invalid Token Payload',400,'Invalid Token Payload'));
        }

        const user=await User.findById(decodedData._id).populate("sessionId").select("-password")
        if(!user){
            return next(new errorHandlerClass('Please signUp',400,'Please signUp'));
        }

        const validSession = !!user.sessionId?.find(
            (session) => session.sessionId === decodedData.sessionId
          );
      
          if (!validSession) {
            return next(
              new errorHandlerClass("Please login again", 400, "Please login again")
            );
          }

        req.authUser=user
        next()
    }
}                   