// src/index.js
import initializeDatabase from './index.js';
import models from './models/index.js';

async function startApplication() {
  await initializeDatabase();
  
  // Start your application logic here
  console.log('Application started successfully');
}

startApplication().catch(console.error);