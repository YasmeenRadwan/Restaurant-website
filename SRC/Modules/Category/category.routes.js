import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { authorization } from "../../Middleware/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.utils.js";
import {multerHost} from "../../Middleware/multer.middleware.js";
import { extensions } from "../../utils/file-extensions.utils.js";


const router= Router();

import * as categoryController from './category.controller.js';
//import { signUpSchema , updateSchema ,updatePasswordSchema ,forgetPasswordSchema } from "./user.schema.js";
//import {validationMiddleware} from '../../Middleware/validation.middleware.js'

router.post('/',auth(),authorization(systemRoles.ADMIN), multerHost({allowedExtensions : extensions.images }).single('image'),errorHandle(categoryController.createCategory));
router.get('/:name',auth(), errorHandle(categoryController.getCategoryByName));
router.get('/',auth(), errorHandle(categoryController.getAllCategories));



export default router;