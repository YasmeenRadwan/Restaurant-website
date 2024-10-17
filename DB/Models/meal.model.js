import mongoose from "mongoose";
const {Schema , model} =mongoose;

const mealSchema=new Schema(
    {
        name: {
            type: String,
            required: true
          },
          price: {
            type: Number,
            required: true
          },
          description: {
            type: String
          },
          category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',  
            required: true
          },
          image: {
            type: String,
            required: true  
          },
          available: {
            type: Boolean,
            default: true  
          }
    },
    {
        Timestamp:true
    }
)


export default mongoose.models.Meal || model("Meal", mealSchema)

////////////  update the meal count when a meal is added//////////////////
mealSchema.post('save', async function () {
  const Category = mongoose.model('Category'); 

  // Count the number of meals for category
  const mealCount = await mongoose.model('Meal').countDocuments({ category: this.category });

  await Category.findByIdAndUpdate(this.category, {
      description: `${mealCount}`
  });
});

//////////// Pre-remove to update the meal count when a meal is deleted//////////////////
mealSchema.post('remove', async function () {
  const Category = mongoose.model('Category');

  const mealCount = await mongoose.model('Meal').countDocuments({ category: this.category });

  await Category.findByIdAndUpdate(this.category, {
      description: `${mealCount}`
  });
});