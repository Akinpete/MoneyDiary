import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class Category extends BaseModel {
    static initModel(sequelize) {
        const baseAttr = super.initModel(sequelize);

        return this.init({
            ...baseAttr,
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true
            },
            is_public: {
                type: DataTypes.BOOLEAN,
                defaultValue: true  // true for preloaded categories, false for custom ones
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: true,    // Null for public categories, otherwise specific to the user
                references: {
                    model: 'User',
                    key: 'id'
                }
            }
        }, {
            sequelize,
            timestamps: false,
            freezeTableName: true,
            modelName: 'Category'
        });
    }

    static associate(models) {
        // Define associations
        this.belongsToMany(models.User, {
            through: 'UserCategory',
            foreignKey: 'category_id'
        });
    
    }

}

export default Category;