import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class Transaction extends BaseModel {
  static initModel(sequelize) {
    const baseAttr = super.initModel(sequelize);
    
    return this.init({
        ...baseAttr,
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
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }      
    }, {
      sequelize,
      timestamps: false,
      modelName: 'Transaction',
      freezeTableName: true
    });
  }

  static associate(models) {
    this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    this.hasMany(models.Embedding, {
        foreignKey: 'transaction_id',
        as: 'embeddings'
    });
  }
}

export default Transaction;