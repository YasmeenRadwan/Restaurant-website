import Cart from "../../../DB/Models/cart.model.js";
import { errorHandlerClass } from "../../utils/error-class.utils.js";
import Address from "../../../DB/Models/address.model.js";
import Order from "../../../DB/Models/order.model.js";
import User from "../../../DB/Models/user.model.js";
import { push , updateOrder} from "../../utils/socket.js";

export const createOrder=async(req,res,next)=>{
    const userId=req.authUser._id;
    const { addressId, contactNumber, paymentMethod,deliveryOption,specialInstructions,preparingTime=30} = req.body;

    const cart = await Cart.findOne({user:userId});

    if(!cart || !cart.cart.length){
        return next(new errorHandlerClass('Cart is empty',400,'Cart is empty'));
    }
   console.log(cart);
   
    let deliveryFee = 0;
    let estimatedDeliveryTime = 0;

    if (deliveryOption === 'delivery') {
        deliveryFee = 15; 
        estimatedDeliveryTime = 90; // 1:30 
    }

    const subTotal = cart.totalCartPrice;
    const total = subTotal + deliveryFee;

    if (!addressId && deliveryOption !== 'pickup') {
        return next(new errorHandlerClass('Address is required for delivery', 400, 'Address is required'));
    }

    if (deliveryOption === 'delivery' && addressId) {
        const addressInfo = await Address.findOne({ _id: addressId, userId });
        if (!addressInfo) {
            return next(new errorHandlerClass('Invalid Address', 404, 'Invalid Address'));
        }
    }
/*
    if(deliveryOption === 'delivery' && address ){
        //save address 
        const newAddress = new Address({
            userId,
            country: address.country,
            city: address.city,
            buildingNumber: address.buildingNumber,
            floorNumber: address.floorNumber,
            addressLabel: address.addressLabel,
        });
        await newAddress.save();
        await User.updateOne(
            { _id: userId },
            { $push: { addresses: newAddress._id } } // Add the address ID to the user's addresses array
        );
    }
 */

    const order = new Order({
        userId,
        menuItems: cart.cart,
        addressId,
        contactNumber,
        paymentMethod,
        deliveryFee,
        subTotal,
        total,
        orderStatus :paymentMethod === "cash"? 'confirmed' :'pending',
        preparingTime,
        estimatedDeliveryTime,
        deliveryOption,
        specialInstructions
    });

    await order.save();

    res.json({ message: "Order created", order });
};

////////////////////////////////get orders ///////////////////////////////////
export const getAllOrders = async (req, res, next) => {
    const userId = req.authUser._id;
    const orders = await Order.find({ userId })
      .populate('menuItems.menuItem','name price description image')
      .populate('addressId', 'city country addressLabel')
      .sort({ createdAt: -1 }); // Sort desc 

    if (orders.length === 0) {
        return next(new errorHandlerClass("No orders found", 404, "No orders found"));
    }

    res.json({ message: "Orders fetched successfully", orders });
};

////////////////////////////////get orders ///////////////////////////////////

export const getOrder = async (req, res, next) => {
    const userId = req.authUser._id;
    const {orderId} = req.params;
    const order = await Order.findOne({ userId,_id:orderId })
      .populate('menuItems.menuItem','name price description image')
      .populate('userId', 'firstName lastName')
      .populate('addressId', 'city country addressLabel');;
    if (!order) {
        return next(new errorHandlerClass("No order found", 404, "No order found"));
    }

    res.json({ message: "Order fetched successfully", order });
};

////////////////////////////////cancel order ///////////////////////////////////

export const cancelOrder = async (req, res, next) => {
    const userId = req.authUser._id;
    const {orderId} = req.params;

    const order = await Order.findOne({ userId, _id: orderId ,  orderStatus: { $in: ['pending', 'confirmed', 'preparing'] }});

    if (!order) {
        return next(new errorHandlerClass("No order found", 404, "No order found"));
    }

    if (order.orderStatus === 'preparing') {
        return next(new errorHandlerClass("Order cannot be cancelled. It has already been placed", 400, "Order cannot be cancelled"));
    }
    
    order.orderStatus = 'cancelled';
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
};

////////////////////////////////update orders by status or userId ///////////////////////////////////
export const getUsersOrders = async (req, res, next) => {
    const { userId, status } = req.query; // Take filters from query parameters

    const filter = {};
    if (userId) {
        filter.userId = userId;
    }
    if (status) {
        filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
        .populate('menuItems.menuItem', 'name price description image')
        .populate('userId', 'firstName lastName')
        .populate('addressId', 'city country addressLabel');

    if (!orders || orders.length === 0) {
        return next(new errorHandlerClass("No orders found", 404, "No orders found"));
    }

    res.json({ message: "Orders fetched successfully", orders });
 
};

////////////////////////////////update order status ///////////////////////////////////
export const updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params; 
    const { status } = req.body; 

    const validOrderStatus = ['pending', 'confirmed', 'preparing', 'cancelled', 'on the way','delivered'];

    if (!validOrderStatus.includes(status)) {
        return next(new errorHandlerClass("Invalid order status", 400, "Invalid order status"));
    }

    const order = await Order.findOneAndUpdate(
        { _id: orderId },
        { orderStatus:status },
        { new: true } 
    );

    if (!order) {
        return next(new errorHandlerClass("Order not found", 404, "Order not found"));
    }

    push(order.userId.toString(), {message : `order status updated: ${order.orderStatus}`, status : order.orderStatus})
    updateOrder(order.userId.toString(), {orderId , status })
    res.json({ message: "Order status updated successfully", order });

};