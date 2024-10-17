import Menu from "../../../DB/Models/menu.model.js";
import Category from "../../../DB/Models/category.model.js";
import {cloudinaryConfig} from "../../utils/cloudinary.utils.js";
import jwt from "jsonwebtoken";
import { errorHandlerClass } from "../../utils/error-class.utils.js";

////////////////////////////// create Category  //////////////////////////////////////////
export const createMenu=async(req,res,next)=>{

   const category = await Category.findById(req.query.category);
   if (!category) {
    return next(new errorHandlerClass("Category not found.", 404, "Category not found."));
}
   const createdBy  = req.authUser._id; 
   const { 
    name,
    price,
    description,
    available,
    ingredients} = req.body;

    if (!req.file) {
        return next(new errorHandlerClass('Please upload an Image.',400,'Please upload an Image.'));
    }
        
    // Check if the Menu already exists
    const isMenuExist = await Menu.findOne({ name });

    if (isMenuExist) {
        return next(new errorHandlerClass("Menu Item already exists",400,"Menu item already exists",{name}))
    }

    const {secure_url,public_id} = await cloudinaryConfig().uploader.upload(req.file.path,{
        public_id: `${name}`, 
        folder : `${process.env.UPLOADS_FOLDER}/Categories/${category.name}/Items`,
    });

    const menuInstance= new Menu({name,
        image: {secure_url,public_id} ,
        categoryId :category._id,
        createdBy,
        price,
        description,
        available,
        ingredients});

    const newMenu = await menuInstance.save();

    res.json({message: "Menu Item created ",newMenu });

}