import models from '../models/index.js';

export const all_debit = async (user_id) => {
    let debits;
    try {
        debits = await models.Transaction.findAll({
            where: {
                user_id: user_id,
                transaction_type: 'debit'
            },
            attributes: ['amount'],
            raw: true
       });
    } catch (error) {
        console.error('Error fetching debit transaction:', error);
        throw error;
    }

    if (debits && debits.length > 0) {
        // const total_debits = debits.map(debit => debit.amount).reduce((acc,amount) => acc + amount, 0);

        const total_debits = debits.reduce((acc, debit) => acc + parseFloat(debit.amount), 0);

        return total_debits.toFixed(2);
    } else {
        return null;
    }

};


export const all_credit = async (user_id) => {
    let credits;
    try {
        credits = await models.Transaction.findAll({
            where: {
                user_id: user_id,
                transaction_type: 'credit'
            },
            attributes: ['amount'],
            raw: true
       });
    } catch (error) {
        console.error('Error fetching credit transaction:', error);
        throw error;
    }

    if (credits && credits.length > 0) {
        // const total_credits = credits.map(credit => credit.amount).reduce((acc,amount) => acc + amount, 0);

        const total_credits = credits.reduce((acc, credit) => acc + parseFloat(credit.amount), 0);

        return total_credits.toFixed(2);
    } else {
        return null;
    }

};