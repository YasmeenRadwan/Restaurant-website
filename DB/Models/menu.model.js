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

export default mongoose.models.Menu || model("Menu", menuSchema)

////////////  update the menu count when a menu item is added//////////////////
menuSchema.post('save', async function () {
  const Category = mongoose.model('Category'); // Get the Category model

  try {
    // Count the number of menu items for this category
    const menuCount = await mongoose.model('Menu').countDocuments({ categoryId: this.categoryId });

    // Fetch the current category
    const category = await Category.findById(this.categoryId);
    
    // Update the Category's description with the menu count
    const updatedDescription = `${category.description || ''} (Total items: ${menuCount})`; // Append count
    await Category.findByIdAndUpdate(this.categoryId, {
      description: updatedDescription
    });
  } catch (error) {
    console.error('Error updating category description:', error);
  }
});

//////////// Pre-remove to update the menu count when a menu item is deleted//////////////////
menuSchema.post('remove', async function () {
  const Category = mongoose.model('Category');

  const menuCount = await mongoose.model('Menu').countDocuments({ category: this.category });

  await Category.findByIdAndUpdate(this.category, {
      description: `${menuCount}`
  });
});