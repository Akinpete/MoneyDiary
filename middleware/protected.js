import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authenticateToken = (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect('/login');
        }
        req.user = user;
        next();
    });
};

export default authenticateToken;