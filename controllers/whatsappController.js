import models from '../models/index.js';

export const get_form = async (req, res) => {
    const user = req.user;
    res.locals.user_username = user.username;
    res.locals.photo_url = user.photo_url;
    res.render('add_whatsapp');
}