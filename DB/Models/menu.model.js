import mongoose from "mongoose";

const {Schema , model} =mongoose;

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
}, { _id: false }); 

const menuSchema=new Schema(
    {
        name: {
            type: String,
            required: true
          },
          price: {
            type: Number,
            required: true,
            min:0
          },
          description: {
            type: String
          },
          categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',  
            required: true
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
          available: {
            type: Boolean,
            default: true  
          },
          orderedTimes: {
            type: Number,
            default: 0,
            min: 0,
          },
          ratings: [ratingSchema],
        
          averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
          },
          ingredients: [
            {
              type: String,
              trim: true,
            },
          ],
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
          },
          editedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
          }
        });
/*
menuSchema.pre('save', function (next) {
  if (this.isModified('ratings')) {
}else {
    this.updatedAt = Date.now();
}
  next();
});
        
menuSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = (sum / this.ratings.length).toFixed(1);
  } else {
    this.averageRating = 0;
  }
};
*/

////////////  update the menu count when a menu item is added//////////////////
menuSchema.post('save', async function () {
  const Category = mongoose.model('Category');

  try {
    // Get the category document by the menu's categoryId
    const menuCount = await mongoose.model('Menu').countDocuments({ categoryId: this.categoryId });

    await Category.findByIdAndUpdate(this.categoryId, { description: `${menuCount}`});
  } catch (error) {
    return next(new errorHandlerClass("Error updating category description:'",400,"Error updating category description:'",error))
  }
});


export default mongoose.models.Menu || model("Menu", menuSchema)



//////////// Pre-remove to update the menu count when a menu item is deleted//////////////////
menuSchema.post('remove', async function () {
  const Category = mongoose.model('Category');

  try {
    // Get the category document by the menu's categoryId
    const menuCount = await mongoose.model('Menu').countDocuments({ categoryId: this.categoryId });

    await Category.findByIdAndUpdate(this.categoryId, { description: `${menuCount}`});
    
  } catch (error) {
    return next(new errorHandlerClass("Error updating category description:'",400,"Error updating category description:'",error))
  }
});