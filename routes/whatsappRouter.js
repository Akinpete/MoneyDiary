import Router from "express";
import * as waController from '../controllers/whatsappController.js';
import authenticateToken from "../middleware/protected.js";


const router = Router();

// console.log(authController);  // Add this line to debug
router.get('/whatsapp', authenticateToken, waController.get_form);
router.post('/whatsapp', authenticateToken, waController.add_wa);
// router.get('/all_transaction', authenticateToken, txnController.all_transactions);
// router.get('/transactions', authenticateToken, txnController.load_transactions_page);
// router.delete('/transactions', authenticateToken, txnController.txn_delete);

export default router;
