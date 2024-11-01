import Router from "express";
import * as authController from '../controllers/authController.js';


const router = Router();

console.log(authController);  // Add this line to debug
router.get('/login', authController.login_get);
router.get('/after-login',authController.after_login_get); // Telegram
router.get('/logout', authController.logout_get);

export default router;
