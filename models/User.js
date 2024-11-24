import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class User extends BaseModel {
  static initModel(sequelize) {
    // Get base attributes from parent class
    const baseAttr = super.initModel(sequelize);
    
    return this.init({
        ...baseAttr,
        // Then add User-specific attributes
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        telegram_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true
        },
        photo_url: { 
          type: DataTypes.STRING, 
          allowNull: true, 
          validate: { 
            isUrl: { 
              msg: "Must be a valid URL" 
            } 
          } 
        },
        // password_hash: {
        //     type: DataTypes.TEXT,
        //     allowNull: false,
        //     unique: true
        // },
        currency: {
            type: DataTypes.STRING,
            allowNull: true
        }      
    }, {
      sequelize,
      timestamps: true,
      underscored: true,
      modelName: 'User',
      freezeTableName: true
    });
  }

  static associate(models) {
    // Define associations
    this.hasMany(models.Transaction, {
        foreignKey: 'user_id',
        as: 'transactions',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });

    this.belongsToMany(models.Category, { 
      through: 'UserCategory',
      foreignKey: 'user_id'
    });

    // this.belongsTo(models.Category, {
    //   foreignKey: 'category_id',
    //   as: 'categories'
    // })

    
  }
}

export default User;