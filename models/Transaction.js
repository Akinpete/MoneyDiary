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
        allowNull: false,
        validate: {
          isIn: {
            args: [['debit', 'credit']],
            msg: "Transaction type must be either 'debit' or 'credit'"
          }
        }
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
        // unique: true,
        references: {
            model: 'User',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      usercategory_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'UserCategory',
          key: 'id'
        },
        onDelete: 'SET NULL',
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
    // Transaction belongs to a single user
    this.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    // Optionally, if there are embeddings associated with each transaction
    this.hasMany(models.Embedding, {
        foreignKey: 'transaction_id',
        as: 'embeddings'
    });

    // Transaction belongs to a single user-specific category
    this.belongsTo(models.UserCategory, {
      foreignKey: 'usercategory_id',
      as: 'usercategory',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
}

export default Transaction;