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
import botInstance from './TelegramHandler/bot2.js';

const app = express();
const PORT = process.env.PORT;

// middleware
app.use(express.static('public'));
app.use(cookieParser());
app.use(variable_views);


//view engine
app.set('view engine', 'ejs');

async function startApplication() {
    await initializeDatabase();
    console.log('DB Initialized successfully');
    
    try {
        app.listen(PORT, () => {
            console.log('Server is running on port 3000');
        });

        // Add delay before launching bot to ensure server is fully up
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Launch bot with retry mechanism
        await botInstance.launchWithRetry();
        console.log('Telegram bot launched successfully');

        // Setup shutdown handlers
        process.once('SIGINT', async () => {
            await botInstance.stop('SIGINT');
            process.exit(0);
        });
        
        process.once('SIGTERM', async () => {
            await botInstance.stop('SIGTERM');
            process.exit(0);
        });

        // Handle connection errors
        process.on('uncaughtException', async (error) => {
            console.error('Uncaught Exception:', error);
            if (error.code === 'ETIMEDOUT') {
                try {
                    await botInstance.resetConnection();
                } catch (e) {
                    console.error('Failed to reset connection:', e);
                    process.exit(1);
                }
            }
        });

    } catch (error) {
        console.error('Failure to start the server:', error);
        process.exit(1);
    }

}

startApplication().catch(console.error);

// routes
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', authenticateToken, (req, res) => {
    const user = req.user;
    res.locals.user_username = user.username;
    res.render('smoothies');
});
app.use(authRoutes);

