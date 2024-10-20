import Menu from "../../../DB/Models/menu.model.js";
import Cart from "../../../DB/Models/cart.model.js";
import mongoose from "mongoose";
import { errorHandlerClass } from "../../utils/error-class.utils.js";

////////////////////////////// add or remove from cart  //////////////////////////////////////////
export const updateCart = async (req, res, next) => {
  // give negative value to remove items e.g (-1)
  const user = req.authUser;
  const { itemId, count } = req.body;

  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    return next(
      new errorHandlerClass(
        "Please select a valid item.",
        400,
        "Please select a valid item.",
      ),
    );
  }

  let cart = await Cart.findById(user.cart);

  if (!cart) {
    return next(
      new errorHandlerClass(
        "Cannot get user's cart.",
        400,
        "Cannot get user's cart.",
      ),
    );
  }

  const itemIndex = cart.cart.findIndex(
    (cartItem) => cartItem.menuItem.toString() === itemId,
  );

  let menuItem = await Menu.findById(itemId);
  if (!menuItem) {
    return next(
      new errorHandlerClass(
        "Menu item not found.",
        404,
        "Menu item not found.",
      ),
    );
  }

  if (itemIndex > -1) {
    let existingCartItem = cart.cart[itemIndex];

    let newQuantity = existingCartItem.quantity + (count || 1);

    if (count < 0) {
      newQuantity = existingCartItem.quantity + count;
    }

    if (newQuantity <= 0) {
      cart.cart.splice(itemIndex, 1);
    } else {
      existingCartItem.quantity = newQuantity;
      existingCartItem.totalPrice = menuItem.price * existingCartItem.quantity;
    }
  } else {
    if (count <= 0) {
      return next(
        new errorHandlerClass(
          "Invalid count for new item.",
          400,
          "Cannot add a new item with negative quantity.",
        ),
      );
    }

    cart.cart.push({
      menuItem: itemId,
      quantity: count || 1,
      totalPrice: menuItem.price * (count || 1),
    });
  }

  await cart.save();

  res.status(200).json({
    message: "Cart updated successfully",
    cart,
  });
};

////////////////////////////// get cart //////////////////////////////////////////
export const getCart = async (req, res, next) => {
  const user = req.authUser;

  const cart = await Cart.findById(user.cart).populate({
    path: "cart.menuItem",
    select: "name price description image averageRating ingredients available categoryId",
  });

  if (!cart) {
    return next(new errorHandlerClass("Cart not found", 404, "Cart not found"));
  }

  res.status(200).json({
    success: true,
    cart,
  });
};

////////////////////////////// remove cart item  //////////////////////////////////////////

export const removeCartItem = async (req, res, next) => {
  const user = req.authUser;
  const { _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return next(
      new errorHandlerClass("Invalid item ID", 400, "Invalid item ID"),
    );
  }

  let cart = await Cart.findById(user.cart);

  if (!cart) {
    return next(new errorHandlerClass("Cart not found", 404, "Cart not found"));
  }

  const itemIndex = cart.cart.findIndex(
    (item) => item.menuItem.toString() === _id,
  );

  if (itemIndex === -1) {
    return next(
      new errorHandlerClass(
        "Item not found in cart",
        404,
        "Item not found in cart",
      ),
    );
  }

  cart.cart.splice(itemIndex, 1);

  // Save the updated cart
  await cart.save();

  res
    .status(200)
    .json({ success: true, message: "Item removed from cart", cart });
};

////////////////////////////// clear the cart  //////////////////////////////////////////

export const clearCart = async (req, res, next) => {
  const user = req.authUser;

  let cart = await Cart.findById(user.cart);

  if (!cart) {
    return next(new errorHandlerClass("Cart not found", 404, "Cart not found"));
  }

  cart.cart = [];
  cart.totalCartPrice = 0;

  await cart.save();

  res.status(200).json({ success: true, message: "Cart cleared", cart });
};

////////////////////////////// check out  //////////////////////////////////////////
export const checkout = async (req, res, next) => {
  const user = req.authUser;

  let cart = await Cart.findById(user.cart).populate("cart.menuItem");

  if (!cart || cart.cart.length === 0) {
    return next(new errorHandlerClass("Cart is empty", 400, "Cart is empty"));
  }

  // order handling // later

  cart.cart = [];
  cart.totalCartPrice = 0;

  await cart.save();

  res.status(200).json({ success: true, message: "Checkout successful!" });
};
