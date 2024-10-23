
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  menuItems: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true,
      },
      quantity: {
        type: Number,
        min: 1,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  contactNumber: {
    type: String,
    required: true,
  },
  subTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  preparingTime: {
    type: Number,  
    default: 60,    // 60 min
  },
  estimatedDeliveryTime: {
    type: Number,
  },
  deliveryFee:{
    type: Number,
    default: 0,
    min: 0,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'cancelled', 'on the way','delivered'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    required: true,
  },
  transactionId : {
    type: String,
  },
  deliveryOption:{
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },
  specialInstructions: {
    type: String,
    trim: true,
  },
  
},
{
  timestamps: true,
});

// Pre-save middleware to clear cart when order status is confirmed
orderSchema.pre('save', async function (next) {
  if (this.isModified('orderStatus') && this.orderStatus === 'confirmed') {
    try {
      // Clear the user cart
      await Cart.findOneAndUpdate({ user: this.userId }, { $set: { cart: [] } });
    } catch (error) {
      return next(error);
    }
  }
  next();
});
const Order = mongoose.model('Order', orderSchema);

export default Order;
