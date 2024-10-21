import mongoose from "mongoose";
import { systemRoles } from "../../SRC/utils/system-roles.utils.js";
import { hashSync} from "bcrypt";
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
            lowercase: true,
            required:true,
            unique:true
        },
        emailConfirmed: {
          type: Boolean,
          default: false,
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
        role: {
            type: String,
            enum:Object.values(systemRoles),
            default:"User"
        },
        status: {
          type: String,
          enum: ["online", "offline"],
          default: "offline",
        },
        sessionId: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
          },
        ],
        orders: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Orders",
          },
        ],
        addresses: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
          },
        ],
        cart: {
          type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
        },
        favourite: [{
          type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
        }],
        otp: { type: String },
        otpExpires: { type: Date }
    },
    {
        Timestamp:true
    }
)

userSchema.pre('save', async function (next) {
  
  // Convert email to lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }

  next();
});
/*
userSchema.pre('save', async function (next) {
 
    if(this.isModified('password')){
      this.password=hashSync(this.password,+process.env.SALT_ROUNDS);
    }
    next();
  });

*/


export default mongoose.models.User || model("User", userSchema)