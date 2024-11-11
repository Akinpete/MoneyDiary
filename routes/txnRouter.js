import Router from "express";
import * as txnController from '../controllers/txnController.js';
import authenticateToken from "../middleware/protected.js";


const router = Router();

// console.log(authController);  // Add this line to debug
router.get('/recent_transaction', authenticateToken, txnController.recent_transactions);
router.get('/all_transaction', authenticateToken, txnController.all_transactions);
router.get('/transactions', authenticateToken, txnController.load_transactions_page);
router.delete('/transactions', authenticateToken, txnController.txn_delete);

export default router;
