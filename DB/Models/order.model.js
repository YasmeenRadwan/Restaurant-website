import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true,
  },
  meals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu', 
    required: true,
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'completed', 'cancelled', "on-the-way"],  
    default: 'pending',
  },
  preparingTime: {
    type: Number,  // in minutes
    default: 0,
  },
  specialInstructions: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,  
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, 
{
  timestamps: true, 
});

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
