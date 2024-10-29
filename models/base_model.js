import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';  // For generating UUIDs

class BaseModel extends Model {
  static initModel(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,  // Automatically generate UUIDs
        primaryKey: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      timestamps: true,  // Automatically handle createdAt and updatedAt
      underscored: true, // snake_case columns like created_at, updated_at
    });
  }
}

export default BaseModel;
