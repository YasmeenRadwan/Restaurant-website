import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { authorization } from "../../Middleware/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.utils.js";
import {multerHost} from "../../Middleware/multer.middleware.js";
import { extensions } from "../../utils/file-extensions.utils.js";


const router= Router();

import * as menuController from './menu.controller.js';

//admin apis
router.post('/',auth(),authorization(systemRoles.ADMIN), multerHost({allowedExtensions : extensions.images }).single('image'),errorHandle(menuController.createMenu));
router.patch('/:_id',auth(),authorization(systemRoles.ADMIN), multerHost({allowedExtensions : extensions.images }).single('image'),errorHandle(menuController.updateMenuItem));
router.delete('/:_id',auth(),authorization(systemRoles.ADMIN), multerHost({allowedExtensions : extensions.images }).single('image'),errorHandle(menuController.deleteMenuItem));

router.get('/:_id', errorHandle(menuController.getMenuById));
router.get('/category/:categoryId',errorHandle(menuController.getMenuForCategory));
router.get('/',errorHandle(menuController.getAllMenu));



export default router;