// middleware/auth.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = (req, res, next) => {
    const password = req.body.password || req.query.password || req.cookies.authenticated;
    if (password === process.env.ADMIN_PASSWORD) {
        res.cookie('authenticated', process.env.ADMIN_PASSWORD, { httpOnly: true });
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};
