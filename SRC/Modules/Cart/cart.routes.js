import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { hasCartMiddleware } from "../../Middleware/cart.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
const router = Router();

import * as cartController from "./cart.controller.js";

router.post(
  "/update",
  auth(),
  hasCartMiddleware,
  errorHandle(cartController.updateCart),
);
router.delete(
  "/clear",
  auth(),
  hasCartMiddleware,
  errorHandle(cartController.clearCart),
);
router.delete(
  "/:_id",
  auth(),
  hasCartMiddleware,
  errorHandle(cartController.removeCartItem),
);
router.get(
  "/",
  auth(),
  hasCartMiddleware,
  errorHandle(cartController.getCart),
);

export default router;
