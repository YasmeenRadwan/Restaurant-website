import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    // required: true,
    min: 0,
    max: 5,
  },
}, { _id: false }); 

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
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
  images: [{
    type: String,
    trim: true,
  }],
  available: {
    type: Boolean,
    default: true,
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
    ref: 'User',
    required: true,
  },
});

menuItemSchema.pre('save', function (next) {
  if (this.isModified('ratings')) {
}else {
    this.updatedAt = Date.now();
}
  next();
});

menuItemSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = (sum / this.ratings.length).toFixed(1);
  } else {
    this.averageRating = 0;
  }
};

const Menu = mongoose.model('Menu', menuItemSchema);

export default Menu;
