const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';

module.exports = function (req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};