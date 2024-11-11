// src/index.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import initializeDatabase from './index.js';
import models from './models/index.js';
import authRoutes from './routes/authRouter.js';
import authenticateToken from './middleware/protected.js';
import BotInstance from './TelegramHandler/bot4.js';
import * as total_txn from './utils/total_transactions.js';
import txnRoutes from './routes/txnRouter.js';
import categoryRoutes from './routes/categoryRouter.js';
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
app.get('/home', authenticateToken, async (req, res) => {
    const user = req.user;
    const db_user = await models.User.findOne({where: {id: user.id}});
    const all_credit = await total_txn.all_credit(user.id);
    const all_debit = await total_txn.all_debit(user.id);
    if (db_user) { 
        res.locals.photo_url = db_user.photo_url; //this is why I did the db lookup for user
        res.locals.user_username = db_user.username; // If you also want to pass the username
        if (!all_credit) {
            res.locals.all_credit = "0.00";
        } else {
            res.locals.all_credit = all_credit;
        }
        if (!all_debit) {
            res.locals.all_debit = "0.00";
        } else {
            res.locals.all_debit = all_debit;
        }
        res.render('login_home'); 
    } else { 
        res.status(404).send('User not found'); 
    } 
});
app.use(authRoutes);
app.use(txnRoutes);
app.use(categoryRoutes);

