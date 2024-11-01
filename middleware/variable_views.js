const variable_views = (req, res, next) => {
    res.locals.user_username = null;  // Set a default value
    next();
}

export default variable_views;