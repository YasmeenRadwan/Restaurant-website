import mongoose from "mongoose";
const {Schema , model} =mongoose;

const categorySchema=new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
          },
          description: {
            type: String
          },
          image : {
            secure_url : {
                type : String,
                required : true
            },
            public_id : {
                type : String,
                required : true,
                unique : true
            }
    },
    customId :{
        type : String,
        required : true,
        unique : true
    },
     createdBy :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
     }},
    {
        Timestamp:true
    }
)

export default mongoose.models.Category || model("Category", categorySchema)