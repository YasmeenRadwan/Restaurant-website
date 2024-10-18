import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { authorization } from "../../Middleware/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.utils.js";
import {multerHost} from "../../Middleware/multer.middleware.js";
import { extensions } from "../../utils/file-extensions.utils.js";


const router= Router();

import * as categoryController from './category.controller.js';

//admin apis
router.post('/',auth(),authorization(systemRoles.ADMIN), multerHost({allowedExtensions : extensions.images }).single('image'),errorHandle(categoryController.createCategory));
router.patch('/:_id',auth(),authorization(systemRoles.ADMIN), multerHost({allowedExtensions : extensions.images }).single('image'),errorHandle(categoryController.updateCategory));
router.delete('/:_id',auth(),authorization(systemRoles.ADMIN), errorHandle(categoryController.deleteCategory));

router.get('/:name', errorHandle(categoryController.getCategoryByName));
router.get('/', errorHandle(categoryController.getAllCategories));



export default router;