// models/UserCategory.js
import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class UserCategory extends BaseModel {
    static initModel(sequelize) {
        const baseAttr = super.initModel(sequelize);

        return this.init({
            ...baseAttr,
            user_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'User',
                    key: 'id'
                },
                allowNull: false
            },
            category_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Category',
                    key: 'id'
                },
                allowNull: false
            }
        }, {
            sequelize,
            freezeTableName: true,
            timestamps: false,
            primaryKey: ['user_id', 'category_id']
        });
    }

    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        this.belongsTo(models.Category, {
            foreignKey: 'category_id',
            as: 'category'
        });
    }
}

export default UserCategory;
