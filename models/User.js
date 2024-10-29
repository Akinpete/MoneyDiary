import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class User extends BaseModel {
  static initModel(sequelize) {
    super.initModel(sequelize);
    
    return this.init({
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      telegram_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true
      }      
    }, {
      sequelize,
      modelName: 'User'
    });
  }

  static associate(models) {
    // Define associations
    this.hasMany(models.Transaction, {
        foreignKey: 'user_id',
        as: 'transactions'
    });
  }
}

export default User;