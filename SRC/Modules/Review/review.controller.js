import { errorHandlerClass } from "../../utils/error-class.utils.js";
import Review from "../../../DB/Models/review.model.js";
import Menu from "../../../DB/Models/menu.model.js";
import Order from "../../../DB/Models/order.model.js"

export const addReview = async (req, res, next) => {
    const userId = req.authUser._id;
    const { itemId,rating, title,text } = req.body;

    //check if item exist
    const item = await Menu.findById(itemId);
    if (!item) {
        return next(new errorHandlerClass("item not found", 404, "item not found"));
    }

    // check user already review the item
    const isAlreadyReviewed= await Review.findOne({userId,itemId});
    if(isAlreadyReviewed){
        return next(new errorHandlerClass("You have already reviewed this item", 400, "You have already reviewed this item"));
    }

    // check user bought the item
    const isBought = await Order.findOne({ userId, "menuItems.menuItem":itemId , orderStatus:'delivered'} );
    if (!isBought) {
        return next(new errorHandlerClass("You have not bought this item", 400, "You have not bought this item"));
    }

    const review = { userId, itemId, reviewRating:rating, reviewTitle:title ,reviewText:text };
    console.log(review);
    
    const newReview = await Review.create(review);

    // Find all reviews for this item
    const reviews = await Review.find({ itemId }); 
    const totalRating = reviews.reduce((sum, review) => sum + review.reviewRating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Update the menu item with the new average rating
    item.averageRating = averageRating.toFixed(2);
    await item.save(); 


    res.json({ message: "Review added successfully", newReview });
}

