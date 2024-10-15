import { Router } from "express";
import { errorHandle } from "../../Middleware/error-handle.middleware.js";
import { auth } from "../../Middleware/auth.middleware.js";
import { authorization } from "../../Middleware/authorization.middleware.js";
import { systemRoles } from "../../utils/system-roles.utils.js";
const router= Router();

import * as userController from './user.controller.js'
import { signUpSchema , updateSchema ,updatePasswordSchema ,forgetPasswordSchema } from "./user.schema.js";
import {validationMiddleware} from '../../Middleware/validation.middleware.js'

router.post('/signUp',validationMiddleware(signUpSchema), errorHandle(userController.signUp))
router.post('/signIn',errorHandle(userController.signIn));
router.patch('/',auth(),validationMiddleware(updateSchema),errorHandle(userController.updateAccount))
router.delete('/',auth(), errorHandle(userController.deleteAccount))
router.get('/',auth(), errorHandle(userController.getAccountData))
router.get('/profile/:userProfileId',auth(),authorization(systemRoles.ADMIN),errorHandle(userController.getProfileData))
router.put('/updatePassword',auth(),validationMiddleware(updatePasswordSchema), errorHandle(userController.updatePassword))
router.post('/otpPassword', errorHandle(userController.otpPassword))
router.post('/forgetPassword', validationMiddleware(forgetPasswordSchema),errorHandle(userController.forgetPassword))

export default router


