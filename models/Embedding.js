// src/models/Embedding.js
import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class Embedding extends BaseModel {
  static initModel(sequelize) {
    super.initModel(sequelize);

    return this.init({
      data: {
        type: DataTypes.VECTOR(3), // 3-dimensional vector
        allowNull: false
      },
      transaction_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Transaction',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'Embedding'
    });
  }

  static associate(models) {
    this.belongsTo(models.Transaction, {
      foreignKey: 'transaction_id',
      as: 'transaction'
    });
  }
}

export default Embedding;