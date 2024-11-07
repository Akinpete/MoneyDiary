// src/index.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import initializeDatabase from './index.js';
import models from './models/index.js';
import authRoutes from './routes/authRouter.js';
import authenticateToken from './middleware/protected.js';
import variable_views from './middleware/variable_views.js';
import BotInstance from './TelegramHandler/bot4.js';
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");


const app = express();
const PORT = process.env.PORT;
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename);

// middleware
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(variable_views);


//view engine
// app.set('views', path.join(__dirname, 'views2'));
app.set('view engine', 'ejs');


async function startApplication() {
    try {
        // Initialize database first
        await initializeDatabase();
        console.log('DB Initialized successfully');

        // Start the server and wait for it to be ready
        await new Promise((resolve, reject) => {
            const server = app.listen(PORT, () => {
                console.log('Server is running on port 3000');
                resolve();
            });

            server.on('error', (error) => {
                reject(error);
            });
        });

        // Initialize and launch the bot with your BotInstance class
        try {
            await botInstance.initialize();
            await botInstance.launchWithRetry();
            console.log('Telegram bot launched successfully');
        } catch (botError) {
            console.error('Failed to start Telegram bot:', botError);
            throw botError;
        }

        // No need to setup additional shutdown handlers as they're already in your BotInstance class
        // Just add handlers for uncaught exceptions and unhandled rejections

        // Handle uncaught exceptions
        process.on('uncaughtException', async (error) => {
            console.error('Uncaught Exception:', error);
            
            if (error.code === 'ETIMEDOUT' && botInstance.isRunning) {
                try {
                    await botInstance.resetConnection();
                } catch (e) {
                    console.error('Failed to reset connection:', e);
                    process.exit(1);
                }
            } else {
                console.error('Fatal uncaught exception:', error);
                process.exit(1);
            }
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', async (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            
            if (reason && reason.code === 'ETIMEDOUT' && botInstance.isRunning) {
                try {
                    await botInstance.resetConnection();
                } catch (e) {
                    console.error('Failed to reset connection:', e);
                    process.exit(1);
                }
            } else {
                console.error('Fatal unhandled rejection:', reason);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('Fatal error during application startup:', error);
        process.exit(1);
    }
}

const botInstance = new BotInstance(process.env.BOT_TOKEN, {
    maxRetries: 5,
    retryDelay: 5000
});

startApplication().catch(console.error);

// routes
app.get('/', (req, res) => res.render('home'));
app.get('/home', authenticateToken, (req, res) => {
    const user = req.user;
    res.locals.user_username = user.username;
    res.render('login_home');
});
app.get('/transactions', authenticateToken, (req, res) => {
    const user = req.user;
    res.locals.user_username = user.username;
    res.render('transactions');
});

app.get('/categories', authenticateToken, async (req, res) => {
    const user = req.user;
    res.locals.user_username = user.username;
    const categories = await models.Category.findAll({ raw: true});
    res.locals.user_categories = categories;
    res.render('categories');
});

app.post('/categories', authenticateToken, async (req, res) => {
    try {
  
      const selectedOptions = req.body;
      const user = req.user;
      
  
      // Save each option as a separate row in the Category table
      for (const option of selectedOptions) {
        const category= await models.Category.findOne({ name: option });
        await models.UserCategory.create({ 
            name: option,
            user_id: user.id,
            category_id: category.id
         });
      }
  
      // Send a success response
    //   res.json({ message: 'Fundraiser options saved successfully' });
      res.render('home');
    } catch (error) {
      console.error('Error saving fundraiser options:', error);
      res.status(500).json({ message: 'Error saving fundraiser options' });
    }
});
app.use(authRoutes);

