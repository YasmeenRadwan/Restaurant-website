import mongoose from 'mongoose';
const {Schema , model} =mongoose;

const reviewSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
    },
    reviewRating:{
        type: Number,
        min: 1,
        max: 5
    },
    reviewTitle:{
        type: String,
        required: true,
    },
    reviewText:{
        type: String,
    },
},
    {timestamps: true}
)


export default mongoose.models.Review || model("Review", reviewSchema)