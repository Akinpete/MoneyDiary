// src/models/custom-datatypes.js
import { Sequelize } from 'sequelize';
import pgvector from 'pgvector/sequelize';

pgvector.registerTypes(Sequelize);