// src/index.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import initializeDatabase from './index.js';
import models from './models/index.js';
import authRoutes from './routes/authRouter.js';

const app = express();
const PORT = process.env.PORT;

// middleware
app.use(express.static('public'));

//view engine
app.set('view engine', 'ejs');

async function startApplication() {
  await initializeDatabase();
  console.log('DB Initialized successfully');
  try {
    app.listen(PORT, () => {
        console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error('Failure to start the server', error);
  }
}

startApplication().catch(console.error);

// routes
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', (req, res) => res.render('smoothies'));
app.use(authRoutes);