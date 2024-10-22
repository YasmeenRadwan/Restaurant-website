import { errorHandlerClass } from "../../utils/error-class.utils.js";
import Review from "../../../DB/Models/review.model.js";
import Menu from "../../../DB/Models/menu.model.js";

export const addReview = async (req, res, next) => {
    const userId = req.authUser._id;
    const { itemId,rating, text } = req.body;

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

    const review = { userId, itemId, reviewRating:rating, reviewText:text };
    const newReview = await Review.create(review);

    res.json({ message: "Review added successfully", newReview });
    

}