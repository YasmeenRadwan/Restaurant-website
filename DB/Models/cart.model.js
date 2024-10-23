import mongoose from "mongoose"

const cartSchema = new mongoose.Schema({
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
        required: true,
        min: 0,
      }
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  totalCartPrice: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  }
});

cartSchema.pre("save", function (next) {
  if(this.cart.length === 0){
    this.totalCartPrice = 0
  }else{
    let total = 0;
    this.cart.forEach(item => {
      total += item.totalPrice;
    });
    this.totalCartPrice = total;
  }
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
