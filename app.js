import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import initializeDatabase from './index.js';
import models from './models/index.js';
import authRoutes from './routes/authRouter.js';
import authenticateToken from './middleware/protected.js';
import BotInstance from './TelegramHandler/bot5.js';
import * as total_txn from './utils/total_transactions.js';
import txnRoutes from './routes/txnRouter.js';
import categoryRoutes from './routes/categoryRouter.js';
import waRoutes from './routes/whatsappRouter.js';
import * as MetaDelete from './middleware/meta_delete.js';
// import { setDefaultResultOrder } from "node:dns";
// setDefaultResultOrder("ipv4first");


const app = express();
const PORT = process.env.PORT;
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename);

// middleware
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



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
app.get('/privacy', async (req, res) => {
    res.render('privacy_policy', {
        effectiveDate: 'February 12, 2025', 
        contactEmail: 'admin@moniediary.com'
    });
});

app.get('/tos', async (req, res) => {
    res.render('tos', {
        effectiveDate: 'February 12, 2025', 
        contactEmail: 'admin@moniediary.com'
    });
});

app.post('/data_deletion', async (req, res) => {
    const signedRequest = req.body.signed_request;
    if (!signedRequest) {
      return res.status(400).json({ error: 'signed_request parameter missing' });
    }
  
    const data = MetaDelete.parseSignedRequest(signedRequest);
    if (!data) {
      return res.status(400).json({ error: 'Invalid signed_request' });
    }
  
    const user_id = data.user_id; // Retrieved user ID from the parsed data
    console.log('Data deletion requested for user:', userId);

    try {
        // Example: Delete user's related data (customize as needed)
        await Promise.all([
          models.Transaction.destroy({ where: { user_id } }),
          // Add other models as required.
        ]);
    
        // Optionally, you could also delete the user record:
        // await User.destroy({ where: { id: userId } });
    
        // Prepare deletion response data
        const confirmationCode = MetaDelete.generateRandomCode(6); // Unique code for the deletion request  
        const statusUrl = `https://cardinal-advanced-buffalo.ngrok-free.app/deletion?id=${confirmationCode}`; // URL to track the deletion
    
        return res.json({
          url: statusUrl,
          confirmation_code: confirmationCode
        });
      } catch (error) {
        console.error('Error during data deletion:', error);
        return res.status(500).json({ error: 'Server error during data deletion.' });
      }

});

app.get('/deletion', (req, res) => {
    // Extract the confirmation code from the query parameters.
    const confirmationCode = req.query.id;
  
    if (!confirmationCode) {
      return res.status(400).send('Missing confirmation code.');
    }
  
    // Render the delete.ejs view with the confirmation code
    res.render('deleted', { confirmationCode });
  });


app.use(authRoutes);
app.use(waRoutes);
app.use(txnRoutes);
app.use(categoryRoutes);

