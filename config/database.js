// config/database.js
import dotenv from 'dotenv';
dotenv.config();
export default {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'postgres',
        dialectOptions: {
            useUTC: false,
            dateStrings: true,
            typeCast:true
        },
        logging: console.log
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: console.log      
    }
  };