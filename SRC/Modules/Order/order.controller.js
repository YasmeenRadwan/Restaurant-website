import Cart from "../../../DB/Models/cart.model.js";
import { errorHandlerClass } from "../../utils/error-class.utils.js";
import Address from "../../../DB/Models/address.model.js";
import Order from "../../../DB/Models/order.model.js";
import User from "../../../DB/Models/user.model.js";


export const createOrder=async(req,res,next)=>{
    const userId=req.authUser._id;
    const { address , addressId, contactNumber, paymentMethod,deliveryOption,specialInstructions,preparingTime=30} = req.body;

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

    if (!address && !addressId && deliveryOption !== 'pickup') {
        return next(new errorHandlerClass('Address is required for delivery', 400, 'Address is required'));
    }

    if (deliveryOption === 'delivery' && addressId) {
        const addressInfo = await Address.findOne({ _id: addressId, userId });
        if (!addressInfo) {
            return next(new errorHandlerClass('Invalid Address', 404, 'Invalid Address'));
        }
    }

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

    let orderStatus;

    // Set order status based on payment method
    if (paymentMethod === "cash") {
        orderStatus = 'placed';
    } else {
        orderStatus = 'pending';
    }

    const order = new Order({
        userId,
        menuItems: cart.cart,
        address :deliveryOption === 'delivery'? address : undefined,
        addressId,
        contactNumber,
        paymentMethod,
        deliveryFee,
        subTotal,
        total,
        orderStatus,
        preparingTime,
        estimatedDeliveryTime,
        deliveryOption 
    });

    await order.save();

    cart.cart=[];
    await cart.save();

    res.json({ message: "Order created", order });
};

////////////////////////////////get orders ///////////////////////////////////

export const getAllOrders = async (req, res, next) => {
    const userId = req.authUser._id;
    const orders = await Order.find({ userId }).populate({
        path: 'menuItems.menuItem',
        select: 'name price description image'  
    });
    if (orders.length === 0) {
        return next(new errorHandlerClass("No orders found", 404, "No orders found"));
    }

    res.json({ message: "Orders fetched successfully", orders });
};

////////////////////////////////get orders ///////////////////////////////////

export const getOrder = async (req, res, next) => {
    const userId = req.authUser._id;
    const {orderId} = req.params;
    const order = await Order.findOne({ userId,_id:orderId }).populate({
        path: 'menuItems.menuItem',
        select: 'name price description image'  
    });
    if (!order) {
        return next(new errorHandlerClass("No order found", 404, "No order found"));
    }

    res.json({ message: "Order fetched successfully", order });
};