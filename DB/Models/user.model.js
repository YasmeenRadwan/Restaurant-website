import mongoose from "mongoose";
import { systemRoles } from "../../SRC/utils/system-roles.utils.js";
const {Schema , model} =mongoose;

const userSchema=new Schema(
    {
        firstName:{
            type:String,
            required:true 
        },
        lastName:{
            type:String,
            required:true 
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
            min:6
        },
        mobileNumber : {
            type: String,
            unique:true,
            sparse: true,
        },
        address: [{
            street: {
                type: String,
                minlength: 3,
                maxlength: 100
            },
            city: {
                type: String,
                minlength: 3,
                maxlength: 50
            },
            country: {
                type: String,
                minlength: 3,
                maxlength: 50
            },
            buildingName: {
                type: String,
                minlength: 3,
                maxlength: 100
            },
            apartmentNo: {
                type: String,
                minlength: 1,
                maxlength: 10
            }, 
            additional:{
                type: String,
                minlength: 3,
                maxlength: 200
            }
        }],
        role: {
            type: String,
            enum:Object.values(systemRoles),
            default:"User"
        },
        otp: { type: String },
        otpExpires: { type: Date }
    },
    {
        Timestamp:true
    }
)

export default mongoose.models.User || model("User", userSchema)