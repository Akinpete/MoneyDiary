export const login_get = (req, res) => {
    res.render('login');
}

export const after_login_get = (req, res) => {
    res.send('be like sey e work o');
}