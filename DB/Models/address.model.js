import mongoose from "mongoose";
const {Schema , model} =mongoose;

const addressSchema=new Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
          },
          country:{
            type: String,
            required: true
          },
          city:{
            type: String,
            required: true
        },
        buildingNumber:{
            type: Number,
            required: true
        },
        floorNumber:{
            type: Number,
            required: false
        },
        addressLabel:{
            type: String,
            required: false
        },
        isDefault:{
            type: Boolean,
            default: false
        }
    },{
        Timestamp:true
    }
)

export default mongoose.models.Address || model("Address", addressSchema)