import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
const router = Router();

import * as orderController from "./order.controller.js";

router.post('/',auth(), errorHandle(orderController.createOrder));
 router.get('/',auth(), errorHandle(orderController.getAllOrders));
 router.get('/:orderId',auth(), errorHandle(orderController.getOrder));
 router.patch('/:orderId',auth(), errorHandle(orderController.cancelOrder));

export default router;
