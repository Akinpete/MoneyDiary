// config/database.js
export default {
    development: {
        username: process.env.DB_USERNAME || 'money_diary_dev',
        password: process.env.DB_PASSWORD || 'money_diary_dev_pwd',
        database: process.env.DB_NAME || 'moneydiary',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'postgres',
        dialectOptions: {
            useUTC: false,
            dateStrings: true,
            typeCast:true
        },
        logging: console.log
    },
    production: {
        username: process.env.DB_USERNAME || 'money_diary_prod',
        password: process.env.DB_PASSWORD || 'money_diary_prod_pwd',
        database: process.env.DB_NAME || 'moneydiary',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'postgres', // or 'mysql', etc
        logging: console.log      
    }
  };