import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class Transaction extends BaseModel {
  static initModel(sequelize) {
    super.initModel(sequelize);
    
    return this.init({
      transaction_text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      transaction_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      recipient: {
        type: DataTypes.STRING,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'User',
            key: 'id'
        }
      }      
    }, {
      sequelize,
      modelName: 'Transaction'
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
    this.hasMany(models.Embedding, {
        foreignKey: 'transaction_id',
        as: 'embeddings'
    });
  }
}

export default Query;