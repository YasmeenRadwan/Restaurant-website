import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
import {validationMiddleware} from '../../Middleware/validation.middleware.js';
import { addressSchema } from "./address.schema.js";


const router = Router();
import * as addressController from './address.controller.js';

router.post('/',auth(),validationMiddleware(addressSchema),errorHandle(addressController.addAddress));
router.put('/:addressId',auth(),validationMiddleware(addressSchema),errorHandle(addressController.editAddress));
router.delete('/:addressId',auth(),errorHandle(addressController.deleteAddress));
router.get('/',auth(),errorHandle(addressController.getAllAddresses))

export default router;