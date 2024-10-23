import Order from "../../../DB/Models/order.model.js";
import mongoose from "mongoose";
import { errorHandlerClass } from "../../utils/error-class.utils.js";
import axios from "axios"; 

export const intiateThePayment = async (req, res, next) => {
  const user = req.authUser;
  const { orderId } = req.body;

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    return next(
      new errorHandlerClass(
        "Please select a valid order.",
        400,
        "Please select a valid order."
      )
    );
  }

  let order = await Order.findById(orderId);

  if (!order) {
    return next(
      new errorHandlerClass(
        "Cannot get user's order.",
        400,
        "Cannot get user's order."
      )
    );
  }

  let totalPrice = order.total;
  
  if (!totalPrice) {
    return next(
      new errorHandlerClass(
        "Invalid user's order.",
        400,
        "Invalid user's order."
      )
    );
  }
  
  
  // assume the usd stay at 48 for ever 
  totalPrice = order.total / 48


  const paypalApiUrl = "https://api-m.sandbox.paypal.com/v2/checkout/orders"; 
  const clientId = process.env.PAYPAL_CLIENT_ID; 
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET; 

  try {
    const response = await axios.post(paypalApiUrl, {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { value: totalPrice.toFixed(2) ,  currency_code: "USD" },
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    } , {
      auth: {
        username: clientId,
        password: clientSecret
      }
    });


    order.transactionId = response.data.id

    await order.save()


    res.status(200).json({
      message: "Order created successfully",
      orderId: response.data.id,
      approveLink: response.data.links.find(link => link.rel === "approve").href 
    });

  } catch (error) {
    console.error("PayPal error:", error.response.data);
    return next(
      new errorHandlerClass(
        "Failed to create order with PayPal.",
        500,
        "PayPal error: " + error.response.data.message
      )
    );
  }
};


export const updateThePayment = async (req, res, next) => {
  const user = req.authUser;
  const { orderId ,
    paypalOrderId,
    payerInfo } = req.body;


    console.log(orderId, paypalOrderId);

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    return next(
      new errorHandlerClass(
        "Please select a valid order.",
        400,
        "Please select a valid order."
      )
    );
  }

  if (!paypalOrderId ) {
    return next(
      new errorHandlerClass(
        "Invalid payment id.",
        400,
        "Invalid payment id."
      )
    );
  }

  let order = await Order.findOne({_id : orderId , transactionId : paypalOrderId});

  if (!order) {
    return next(
      new errorHandlerClass(
        "Cannot get user's order.",
        400,
        "Cannot get user's order."
      )
    );
  }

  const paypalApiUrl = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paypalOrderId}`
  const clientId = process.env.PAYPAL_CLIENT_ID; 
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET; 

  try {
    const response = await axios.get(paypalApiUrl,  {
      auth: {
        username: clientId,
        password: clientSecret
      }
    });

    const { status, purchase_units } = response.data;
    const isPaid = status === 'COMPLETED';
   
    
    if(!isPaid) {
      return next(
        new errorHandlerClass(
          "Payment Failed.",
          400,
          "Payment Failed."
        )
      );
    }
    
    order.orderStatus = "confirmed"
    await order.save()



    res.status(200).json({
      message: "Order paid successfully",
      orderId: response.data.id,
      isPaid
    });

  } catch (error) {
    console.error("PayPal error:", error.response.data);
    return next(
      new errorHandlerClass(
        "Failed to create order with PayPal.",
        500,
        "PayPal error: " + error.response.data.message
      )
    );
  }
};