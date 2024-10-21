import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { authorization } from "../../Middleware/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.utils.js";
const router = Router();

import * as orderController from "./order.controller.js";

 //admin api
 router.get('/admin',auth(), authorization(systemRoles.ADMIN), errorHandle(orderController.getUsersOrders));
 router.patch('/admin/:orderId',auth(), authorization(systemRoles.ADMIN), errorHandle(orderController.updateOrderStatus));


router.post('/',auth(), errorHandle(orderController.createOrder));
 router.get('/',auth(), errorHandle(orderController.getAllOrders));
 router.get('/:orderId',auth(), errorHandle(orderController.getOrder));
 router.patch('/:orderId',auth(), errorHandle(orderController.cancelOrder));


 export default router;

