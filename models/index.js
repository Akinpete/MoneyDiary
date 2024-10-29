import sequelize from '../database/sequelize.js';  // Ensure sequelize.js registers pgvector
import User from './User.js';
import Transaction from './Transaction.js';
import Embedding from './Embedding.js';

const models = {
    User,
    Transaction,
    Embedding
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