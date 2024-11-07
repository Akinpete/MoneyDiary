import BaseModel from './base_model.js';
import { DataTypes } from 'sequelize';

class Category extends BaseModel {
    static initModel(sequelize) {
        const baseAttr = super.initModel(sequelize);

        return this.init({
            ...baseAttr,
            name: {
                type: DataTypes.TEXT,
                allowNull: false
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