const db = require('../database/db');
const { userExists, hashPassword, comparePassword } = require('../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';
const passport = require("passport");

const generateToken = (user) => {
  const payload = { userId: user.id, username: user.username, type: user.type };
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await userExists(username, email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await hashPassword(password);
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function (err, result) {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      const token = generateToken({ id: result.insertId, username, type: 'user' });
      res.json({ token });
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const token = generateToken(user);
    res.json({ token });
  })(req, res, next);
};

module.exports.logout = (req, res) => {
  res.json('Logged Out');
};

module.exports.loginStrategy = async (username, password, done) => {
  try {
    const [user] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE username=?', [username], function (err, rows) {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (!user) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }

    return done(null, { id: user.id, username: user.username, type: user.type });
  } catch (err) {
    return done(err);
  }
};