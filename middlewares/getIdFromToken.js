const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';

module.exports = function (req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
}