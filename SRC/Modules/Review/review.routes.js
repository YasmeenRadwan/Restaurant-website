import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";

const router = Router();

import * as reviewController from "./review.controller.js";

router.post('/',auth(), errorHandle(reviewController.addReview));

export default router;