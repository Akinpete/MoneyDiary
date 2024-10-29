import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class User extends BaseModel {
  static initModel(sequelize) {
    super.initModel(sequelize);
    
    return this.init({
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      // other fields...
    }, {
      sequelize,
      modelName: 'User'
    });
  }

  static associate(models) {
    // Define associations
    this.hasMany(models.Query);
  }
}

export default User;