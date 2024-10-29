import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class Query extends BaseModel {
  static initModel(sequelize) {
    super.initModel(sequelize);
    
    return this.init({
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      // other fields...
    }, {
      sequelize,
      modelName: 'Query'
    });
  }

  static associate(models) {
    this.belongsTo(models.User);
    this.hasMany(models.Embedding);
  }
}

export default Query;