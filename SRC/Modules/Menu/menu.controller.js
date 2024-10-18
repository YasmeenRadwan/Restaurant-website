import Menu from "../../../DB/Models/menu.model.js";
import Category from "../../../DB/Models/category.model.js";
import {cloudinaryConfig} from "../../utils/cloudinary.utils.js";
import {nanoid} from "nanoid";
import jwt from "jsonwebtoken";
import { errorHandlerClass } from "../../utils/error-class.utils.js";

////////////////////////////// create Menu Item  //////////////////////////////////////////
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

    const customId= nanoid(4);
    const {secure_url , public_id} = await cloudinaryConfig().uploader.upload(req.file.path,{
        folder : `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/${customId}`,
        }
    )

    const menuInstance= new Menu({name,
        image: {secure_url,public_id} ,
        customId,
        categoryId :category._id,
        createdBy,
        price,
        description,
        available,
        ingredients});

    const newMenu = await menuInstance.save();

    res.json({message: "Menu Item created ",newMenu });

}

////////////////////////////// get Menu item by Id  //////////////////////////////////////////
export const getMenuById  = async (req, res,next) => {
    const {_id} = req.params;

    if (!_id) {
        return next(new errorHandlerClass("Menu Item is required", 400, "Menu Item is required"));
    }

    const menuItem = await Menu.findById(_id)
    if (!menuItem){
          return next (new errorHandlerClass("Menu Item not found", 404, "Menu Item not found"));
       }

       res.json({ message: "Menu item data fetched successfully", menuItem });

}

////////////////////////////// get all Menu Items for a category  //////////////////////////////////////////
export const getMenuForCategory = async (req, res,next) => {
    const { categoryId } = req.params;

    const Menuitems = await Menu.find({categoryId});

    if (Menuitems.length === 0) {
        return next (new errorHandlerClass("Error in getting menu items for this category", 404, "Error in getting menu items for this category"));
        }
        res.json({ message: "menu items for this category fetched successfully", Menuitems });

  }


  ////////////////////////////// get all Menu Items  //////////////////////////////////////////
export const getAllMenu = async (req, res,next) => {

    const allMenu = await Menu.find();

    if (allMenu.length === 0) {
          return next (new errorHandlerClass("Error in getting Menu", 404, "Error in getting Menu"));
       }
       res.json({ message: "Menu data fetched successfully", allMenu });

}

  ////////////////////////////// update Menu Items  //////////////////////////////////////////

export const updateMenuItem = async(req,res,next) => {
    const {_id} = req.params;

    const updatedBy  = req.authUser._id; 

    const { 
    name,
    price,
    description,
    available,
    ingredients} = req.body;

    const menu = await Menu.findById(_id).populate('categoryId');
    console.log("menu",menu);
    
    if(!menu){
        return next(new errorHandlerClass('menu item not found',404,'menu item not found'));
    }

    if (name) menu.name = name;
    if (price) menu.price = price;
    if (description) menu.description = description;
    if (available !== undefined) menu.available = available;  
    if (ingredients) menu.ingredients = ingredients;
    
    if(req.file){
        const splitedPublicId = menu.image.public_id.split(`${menu.customId}/`)[1];
        console.log(splitedPublicId);
        
      
        const { secure_url } = await cloudinaryConfig().uploader.upload(
        req.file.path,
        {
            folder: `${process.env.UPLOADS_FOLDER}/Categories/${menu.categoryId.customId}/${menu.customId}`,
            public_id: splitedPublicId,
        }
        );
        menu.image.secure_url = secure_url;
        }

        menu.editedBy = updatedBy;
    
    const updatedMenu = await menu.save();
    res.json({ message: "Menu data updated successfully", updatedMenu });
}

//////////////////////////// delete Menu Items  //////////////////////////////////////////
export const deleteMenuItem = async(req,res,next) => {
    const {_id} = req.params;
    const menu = await Menu.findByIdAndDelete(_id).populate('categoryId');

    if(!menu){
        return next(new errorHandlerClass('menu item not found',404,'menu item not found'));
    }
    const menuItemPath=`${process.env.UPLOADS_FOLDER}/Categories/${menu.categoryId.customId}/${menu.customId}`;
    await cloudinaryConfig().api.delete_resources_by_prefix(menuItemPath);
    await cloudinaryConfig().api.delete_folder(menuItemPath);

    res.json({message: "menu item deleted successfully"});
}