import { Model, DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';  // For generating UUIDs

class BaseModel extends Model {
    static initModel(sequelize) {
      return {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      };
    }
  }

export default BaseModel;
