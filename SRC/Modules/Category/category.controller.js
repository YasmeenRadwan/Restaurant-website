import Category from "../../../DB/Models/category.model.js";
import {cloudinaryConfig} from "../../utils/cloudinary.utils.js";
import jwt from "jsonwebtoken";
import { errorHandlerClass } from "../../utils/error-class.utils.js";

////////////////////////////// create Category  //////////////////////////////////////////
export const createCategory=async(req,res,next)=>{
   const createdBy  = req.authUser._id; 
   const { name } = req.body;

    if (!req.file) {
        return next(new errorHandlerClass('Please upload an Image.',400,'Please upload an Image.'));
    }
        
    // Check if the category already exists
    const isCategoryExist = await Category.findOne({ name });

    if (isCategoryExist) {
        return next(new errorHandlerClass("Category already exists",400,"Category already exists",{name}))
    }

    const {secure_url,public_id} = await cloudinaryConfig().uploader.upload(req.file.path,{
        public_id: `${name}`, 
        folder : `${process.env.UPLOADS_FOLDER}/Categories/${name}`,
    });

    const categoryInstance= new Category({name,  image: {secure_url,public_id} , createdBy});

    const newCategory = await categoryInstance.save();

    res.json({message: "category created ",newCategory });

}

////////////////////////////// get Category by name  //////////////////////////////////////////
export const getCategoryByName  = async (req, res,next) => {
    const {name} = req.params;

    if (!name) {
        return next(new errorHandlerClass("Category name is required", 400, "Please provide a category name"));
    }

    const category = await Category.findOne({ name});
    if (!category){
          return next (new errorHandlerClass("category not found", 404, "category not found"));
       }

       res.json({ message: "category data fetched successfully", category });

}

////////////////////////////// get all Categories  //////////////////////////////////////////
export const getAllCategories = async (req, res,next) => {

      const categories = await Category.find();

      if (categories.length === 0) {
            return next (new errorHandlerClass("Error in getting categories", 404, "Error in getting categories"));
         }
         res.json({ message: "categories data fetched successfully", categories });

  }

