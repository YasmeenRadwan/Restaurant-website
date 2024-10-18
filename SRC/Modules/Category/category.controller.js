import Category from "../../../DB/Models/category.model.js";
import Menu from "../../../DB/Models/menu.model.js";
import {cloudinaryConfig} from "../../utils/cloudinary.utils.js";
import {nanoid} from "nanoid";
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

    const customId=nanoid(4);
    const {secure_url,public_id} = await cloudinaryConfig().uploader.upload(req.file.path,{
        folder : `${process.env.UPLOADS_FOLDER}/Categories/${customId}`,
    });

    const categoryInstance= new Category({name,  image: {secure_url,public_id} ,customId, createdBy});

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

  ////////////////////////////// Update Category  //////////////////////////////////////////

export const updateCategory = async (req, res, next) => {
    const { _id } = req.params;

    const category = await Category.findById(_id);

    if (!category) {
        return next(new errorHandlerClass('Category not found', 404, 'Category not found'));
    }

    const {name , public_id} = req.body ;
    if(name){
        category.name = name;
    }

    if (req.file) {

        const splitedPublicId = category.image.public_id.split(
          `${category.customId}/`
        )[1];
    
        const { secure_url } = await cloudinaryConfig().uploader.upload(
          req.file.path,
          {
            folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`,
            public_id: splitedPublicId,
          }
        );
        console.log("imag",category.image);
        category.image.secure_url = secure_url;
      }

    // Save the updated category in MongoDB
    const updatedCategory = await category.save();

    res.status(200).json({message: "Category updated successfully",updatedCategory});
};
  ////////////////////////////// delete Category  //////////////////////////////////////////

export const deleteCategory = async(req,res,next) =>{
    const {_id} = req.params;

    const category = await Category.findByIdAndDelete(_id);
    if(!category){
        return next(new errorHandlerClass('Category not found',404,'Category not found'));
    }

    const categoryPath=`${process.env.UPLOADS_FOLDER}/Categories/${category.customId}`;

    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
    await cloudinaryConfig().api.delete_folder(categoryPath);

    // delete relevent menu from db
    await Menu.deleteMany({categoryId: _id});


    res.json({message: "Category deleted successfully",category})
}

