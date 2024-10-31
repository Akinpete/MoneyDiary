import { checkTelegramAuthorization } from '../utils/TelegramAuth.js'
import jwt from 'jsonwebtoken';
import models from '../models/index.js'

const JWT_SECRET=process.env.JWT_SECRET

export const login_get = (req, res) => {
    res.render('login');
}

export const after_login_get = async (req, res) => {
    try {
        const authData = checkTelegramAuthorization(req.query);
        let user = await models.User.findOne({ where: { telegram_id: authData.id } });
        if (!user) {
            user = await models.User.create({
                telegram_id: authData.id,
                username: authData.username              
            })
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id, telegram_id: user.telegram_id }, JWT_SECRET, {
            expiresIn: '1h'  // Token expiry time (adjust as needed)
        });

        // Store token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,  // Prevents client-side access to the cookie
            secure: true
            // maxAge: 3600000 // 1 hour (same as token expiry)
        });

        // res.send('be like sey e work o');
        res.redirect('/smoothies');

    } catch (error) {
        console.error(error);
        res.status(400).send('Error occurred');
    }    




};