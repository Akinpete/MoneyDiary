import Router from "express";
import * as authController from '../controllers/authController.js';


const router = Router();

router.get('/login', authController.login_get);
router.get('/after-login',authController.after_login_get);
router.get('/logout', authController.logout_get);

export default router;
