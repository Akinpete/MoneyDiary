// src/models/Embedding.js
import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class Embedding extends BaseModel {
  static initModel(sequelize) {
    const baseAttr = super.initModel(sequelize);

    return this.init({
        ...baseAttr,
      data: {
        type: DataTypes.VECTOR(1536), // OpenAi vector 1536-dimensional
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
      indexes: [
        {
          fields: ['data'],
          using: 'hnsw',
          operator: 'vector_cosine_ops'
        }
      ],
      modelName: 'Embedding',
      timestamps: false,
      freezeTableName: true
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