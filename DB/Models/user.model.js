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

        cart: [
            {
              menuItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Menu", 
                required: true,
              },
              quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1,
              },
              customizations: {
                type: String, 
                maxlength: 200,
              },
              totalPrice: {
                type: Number,
                min: 0,
              }
            },
          ],
        otp: { type: String },
        otpExpires: { type: Date }
    },
    {
        Timestamp:true
    }
)

userSchema.pre('save', async function (next) {
    if (this.isModified('cart')) {
      for (let item of this.cart) {
        const menuItem = await mongoose.model('Menu').findById(item.menuItem);
        item.totalPrice = menuItem.price * item.quantity;
      }
    }
    next();
  });

export default mongoose.models.User || model("User", userSchema)