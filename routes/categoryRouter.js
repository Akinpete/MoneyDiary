import Router from "express";
import * as categoryController from '../controllers/CategoryController.js';
import authenticateToken from "../middleware/protected.js";


const router = Router();

// console.log(authController);  // Add this line to debug
router.get('/categories', authenticateToken, categoryController.load_categories_page);
router.post('/categories',authenticateToken, categoryController.add_categories);

export default router;
