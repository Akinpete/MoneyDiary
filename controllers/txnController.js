import models from '../models/index.js';

export const load_transactions_page = async (req, res) => {
    const user = req.user;
    res.locals.user_username = user.username;
    res.render('transactions');
};

export const recent_transactions = async (req, res) => {
    try {
        const user = req.user;
        const recent_txn = await models.Transaction.findAll({
            where: {
                user_id: user.id
            },
            include: [{
                model: models.UserCategory,
                as: 'usercategory',
                include: [{
                    model: models.Category,
                    as: 'category',
                    attributes: ['name']
                }],
                attributes: []
            }],
            limit: 3,
            order: [['created_at', 'DESC']],
            raw: true
        });
        res.json(recent_txn);
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ error: 'Failed to fetch all transactions' });
    }
};

export const all_transactions = async (req, res) => {
    const user = req.user;
    const all_txn = await models.Transaction.findAll({
        where: {
            user_id: user.id
        },
        include: [
            {
                model: models.UserCategory,
                as: 'usercategory',
                include: [
                    {
                        model: models.Category,
                        as: 'category',
                        attributes: ['name']
                    }
                ],
                attributes: [] // Ensure no extra fields from UserCategory
            }
        ],
        attributes: ['created_at', 'recipient', 'transaction_text', 'amount', 'transaction_type', 'id'],
        order: [['created_at', 'DESC']],
        raw: true // This will give you a flat structure
    });

    res.json(all_txn);
};

export const txn_delete = async (req, res) => {
    try {
        const user = req.user;
        // const transactionId = req.params.id;  // If using route parameter (/transactions/:id)
        const transactionId = req.body.id; // If sending in body
        console.log('I WAN PRINT AM BEFORE E CRASH');
        console.log(req.body);

        // verify the transaction belongs to the user
        const transaction = await models.Transaction.findOne({
            where: {
                id: transactionId,
                user_id: user.id  // Important security check!
            }
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or unauthorized'
            });
        }

        // Delete the transaction
        const result = await models.Transaction.destroy({
            where: {
                id: transactionId,
                user_id: user.id 
            }
        });

        if (result === 1) {
            return res.status(200).json({
                success: true,
                message: 'Transaction deleted successfully'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete transaction'
            });
        }

    } catch (error) {
        console.error('Error deleting transaction:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};