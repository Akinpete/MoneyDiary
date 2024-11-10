import models from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const user = await models.User.findOne({
  where: {
    username: "AkinExpressions"
  }
});
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
  attributes: ['created_at', 'recipient', 'transaction_text', 'amount'],
  order: [['created_at', 'ASC']],
  raw: true // This will give you a flat structure
});

// Function to convert ISO date string to custom format 
function formatISODate(isoString) { 
  const dateObj = new Date(isoString); 
  const year = dateObj.getFullYear(); 
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based 
  const day = dateObj.getDate().toString().padStart(2, '0'); return `${year}-${month}-${day}`;
}


// console.log(all_txn[0]);
const date = all_txn[0];
console.log(date);
console.log(formatISODate(date));
