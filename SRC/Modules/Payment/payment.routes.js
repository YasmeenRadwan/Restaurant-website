import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { hasCartMiddleware } from "../../Middleware/cart.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
const router = Router();

import * as paymentController from "./payment.controller.js";

router.post(
  "/intiate",
  auth(),
  hasCartMiddleware,
  errorHandle(paymentController.intiateThePayment),
);

router.post(
  "/update",
  auth(),
  hasCartMiddleware,
  errorHandle(paymentController.updateThePayment),
);



export default router;
