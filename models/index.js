import sequelize from '../database/sequelize.js';  // Ensure sequelize.js registers pgvector
import User from './User.js';
import Transaction from './Transaction.js';
import Embedding from './Embedding.js';
import Category from './Category.js';
import UserCategory from './UserCategory.js';

const models = {
    User,
    Transaction,
    Embedding,
    Category,
    UserCategory
};

Object.values(models)
  .forEach(model => model.initModel(sequelize));

// Set up associations
Object.values(models)
  .forEach(model => {
    if (model.associate) {
      model.associate(models);
    }
  });

export { sequelize };
export default models;