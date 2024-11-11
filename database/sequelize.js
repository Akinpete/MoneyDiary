import { Sequelize, Op } from 'sequelize';
import pgvector from 'pgvector/sequelize';
import config from '../config/database.js';  // Your config file

pgvector.registerTypes(Sequelize);  // Register the VECTOR datatype

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

export default sequelize;
