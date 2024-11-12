import { Sequelize, Op } from 'sequelize';
import pgvector from 'pgvector/sequelize';
import config from '../config/database.js';  // config file
import dotenv from 'dotenv';
dotenv.config();

pgvector.registerTypes(Sequelize);  // Register the VECTOR datatype - pgvector dccumentation

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {dialect: 'postgres'},
  dbConfig
);

export default sequelize;
