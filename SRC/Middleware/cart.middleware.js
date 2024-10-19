import Cart from "../../DB/Models/cart.model.js";
import { errorHandlerClass } from "../utils/error-class.utils.js";

export const hasCartMiddleware = async (req, res, next) => {
 
    const user = req.authUser;

    if (!user.cart) {
      let cart = new Cart({
        user: user._id,
        cart: [],
        totalCartPrice: 0,
      });
       cart = await cart.save();
      user.cart = cart._id;
      await user.save();
    }

    next();

};
