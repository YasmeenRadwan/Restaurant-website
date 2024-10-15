import { hashSync, compareSync } from "bcrypt";
import User from "../../../DB/Models/user.model.js";
import Session from "../../../DB/Models/session.model.js";
import jwt from "jsonwebtoken";
import { sendEmailService } from "../../Services/send-email.service.js";
import { errorHandlerClass } from "../../utils/error-class.utils.js";
import { v4 as uuidv4 } from "uuid";
import { generateJWT } from "../../utils/jwt.utils.js";
import { userToUser } from "../../utils/userObjectProcess.utils.js";

////////////////////// signUp  ////////////////////////////
export const signUp=async(req,res,next)=>{
 
        const{firstName,lastName,email,password,confirmPassword,mobileNumber,address,role}=req.body;
        const hashedPassword=hashSync(password,+process.env.SALT_ROUNDS);
        // Insure the Email exists
        const isEmailExist=await User.findOne({email})
        
        if (isEmailExist){
          return next(new errorHandlerClass("Email Already Exists",400,"Email Already Exists",{email}))
        }

        const userInstance= new User({firstName,lastName,email,password:hashedPassword,mobileNumber,address,role});

        const sessionId = uuidv4();

        const sessions = new Session({
          sessionId,
          userId: userInstance._id,
        });
      
        await sessions.save();
      
        userInstance.sessionId[0]
          ? userInstance.sessionId.push(sessions._id)
          : (userInstance.sessionId = [sessions._id]);
      
        const token = generateJWT(userInstance._id, sessionId);
        const newUser = await userInstance.save();
        const userToSend = userToUser(newUser);
      
        res.json({ message: "user created ", token, newUser: userToSend });
}

//////////////////////// signIn with email or mobile number/////////////////////////
export const signIn=async(req,res,next)=>{
   
        const{identifier,password}=req.body;
        const user =await User.findOne({
            $or: [
              { email: identifier },
              { mobileNumber: identifier },],
            });
        if (!user){
            return next(new errorHandlerClass("Invalid Credentials",401,"Invalid Credentials",{identifier}))
        }
        const isPasswordMatch=compareSync(password,user.password);

        if (!isPasswordMatch){return next(new errorHandlerClass("Invalid Credentials",401,"Invalid Credentials",{identifier}))}

        const sessionId = uuidv4();

        const session = new Session({
          sessionId,
          userId: user._id,
        });

        await session.save();

        user.sessionId[0]
          ? user.sessionId.push(session._id)
          : (user.sessionId = [session._id]);

        await user.save();
        // Generate a JWT token for the user with their ID and secret signature
        const token = generateJWT(user._id, sessionId);

        const userToSend = userToUser(user);

        res.json({ message: "Logged In Successfully", token, user: userToSend });
};

////////////////////////// update account  //////////////////////////////

export const updateAccount= async(req,res,next)=>{
        
        const {_id}=req.authUser._id;
  
        const {email , mobileNumber ,address, lastName , firstName}=req.body;
        // Check for existing users with the new email or mobileNumber
        if (email) {
            const emailUser = await User.findOne({ email, _id: { $ne: _id } });
            if (emailUser) {
              return next (new errorHandlerClass("Email already exists",409,"Email already exists",{emailUser}))
            }
        }
    
        if (mobileNumber) {
            const mobileNumberUser = await User.findOne({ mobileNumber, _id: { $ne: _id } });
            if (mobileNumberUser) {
             return next (new errorHandlerClass("mobile Number already exists",409,"mobile Number already exists",{mobileNumberUser}))
            }
        }
        const updatedUser=await User.findOneAndUpdate(_id,
            {email , mobileNumber ,address, lastName , firstName},
            {new:true});
        if (!updatedUser){
            return next(new errorHandlerClass("User not found",404,"User not found"))
        }
        res.json({message: "Account updated Successfully",updatedUser})
}

/////////////////////////delete account ///////////////////////////
export const deleteAccount = async(req, res, next) => {
    
        const { _id } = req.authUser;
         const user = await User.findById(_id);
         if (!user) {
            return next(new errorHandlerClass("Error in delete user", 404, "Error in delete user"));
         }
         // delete user 
        const deletedUser = await User.findByIdAndDelete(_id);
        if (!deletedUser) {
            return next(new errorHandlerClass("User not found", 404, "User not found"));
        }
        res.json({ message: "Account deleted successfully" });
};

////////////////////////////get account data ///////////////////////////////////////////
export const getAccountData = async (req,res,next) => {
    const { _id } = req.authUser;
        
         const userData = await User.findById(_id);
         if (!userData) {
            return next(new errorHandlerClass("Error in getting data", 404, "Error in getting data"));
         }
         // return user profile
         res.json({ message: "Account data fetched successfully", userData });
}

////////////////////////////  get Profile data (admin if needed) ///////////////////////////////////////////
export const getProfileData = async (req,res,next) => {
    const { userProfileId }= req.params;
    console.log(userProfileId);

    const userProfileData = await User.findById(userProfileId).select('firstName lastName email mobileNumber address -_id');
    console.log(userProfileData);

    if (!userProfileData) {
            return next(new errorHandlerClass("Error in getting profile data", 404, "Error in getting profile data"));
         }
         res.json({ message: "user profile data fetched successfully", userProfileData })

        }

//////////////////////////////////  Update password   ////////////////////////////////////

export const updatePassword = async (req,res,next) => {
    const { _id } = req.authUser;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(_id);
    if (!user) {
        return next(new errorHandlerClass("User not found", 404, "User not found"));
    }

    const isPasswordMatch = compareSync(currentPassword, user.password);
    if (!isPasswordMatch) {
        return next(new errorHandlerClass("Incorrect current password", 401, "Incorrect current password"));
    }
    console.log(isPasswordMatch);

    const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
    const updatedUser = await User.findByIdAndUpdate(_id, { password: hashedPassword }, { new: true });

    if (!updatedUser) {
        return next(new errorHandlerClass("Error in updating password", 500,"Error in updating password",user.firstName))
    }
    res.json({ message: "Password updated successfully", user:updatedUser.firstName});
}

//////////////////////////////////  OTP password   ////////////////////////////////////
export const otpPassword = async (req,res,next) => {
    const { email } = req.body;
    const user = await User.findOne({email});
    if(!user) {
        return next(new errorHandlerClass("Email not found", 404, "Email not found"))
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = Date.now() + 3600000; // 1 hour (1 hour = 60 minutes = 3,600,000 milliseconds)

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    // send OTP via email
    const isEmailSent= await sendEmailService({
        to:email,
        subject:'Password Reset OTP',
        textMessage:`Your OTP is ${otp}`
    })
    console.log("isEmailSent",isEmailSent);

    if(isEmailSent.rejected.length) {
        return res.json("Verification Failed")
    }
     res.json("OTP sent successfully")
    }

/////////////////////////////////////forgetPassword////////////////////////////////////
    export const forgetPassword = async (req, res, next) => {
    const { email, otp,newPassword } = req.body;
        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
    
        if (!user) {
        return next(new errorHandlerClass("Invalid or expired OTP", 404, "Invalid or expired OTP"))
        }

        const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
    
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
    
        res.json('Password reset successfully');
    }

////////////////////////////  update user Profile data (admin if needed) ///////////////////////////////////////////
export const updateUser= async(req,res,next)=>{
        
    const { userProfileId }= req.params;

    const {email , mobileNumber ,address, lastName , firstName}=req.body;
    // Check for existing users with the new email or mobileNumber
    if (email) {
        const emailUser = await User.findOne({ email, _id: { $ne: userProfileId} });
        if (emailUser) {
          return next (new errorHandlerClass("There is another user with this email",409,"There is another user with this email",{emailUser}))
        }
    }

    if (mobileNumber) {
        const mobileNumberUser = await User.findOne({ mobileNumber, _id: { $ne: userProfileId } });
        if (mobileNumberUser) {
         return next (new errorHandlerClass("There is another user with this mobile Number",409,"There is another user with this mobile Number",mobileNumberUser.mobileNumber))
        }
    }
    const updatedUser=await User.findOneAndUpdate({_id:userProfileId},
        {email , mobileNumber ,address, lastName , firstName},
        {new:true});
    if (!updatedUser){
        return next(new errorHandlerClass("User not found",404,"User not found"))
    }
    res.json({message: "User Account updated Successfully",updatedUser})
}

////////////////////////////  delete user data (admin if needed) ///////////////////////////////////////////
export const deleteUser = async(req, res, next) => {
    
    const { userProfileId }= req.params;
     const user = await User.findById(userProfileId);
     if (!user) {
        return next(new errorHandlerClass("Error in delete user", 404, "Error in delete user"));
     }
     // delete user 
    const deletedUser = await User.findByIdAndDelete({_id:userProfileId});
    if (!deletedUser) {
        return next(new errorHandlerClass("User not found", 404, "User not found"));
    }
    res.json({ message: "User Account deleted successfully" });
};
    










// load user
// to retrive user on loading the page, from the jwt (the auth middlewear do that for us)
export const loadUser = async (req, res, next) => {
  const user = req.authUser;

  if (!user)
    return next(new errorHandlerClass("User not found", 404, "User not found"));

  const userToSend = userToUser(user);

  res.json({ message: "Valid token", user: userToSend });
};
