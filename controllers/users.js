const db = require('../database/db');
const { userExists, hashPassword, comparePassword } = require('../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';
const passport = require("passport");

const generateToken = (user) => {
  const payload = { userId: user.id, username: user.username };
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await userExists(username, email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await hashPassword(password);
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function (err, registeredUser) {
      if (err) {
        throw err;
      }
      const token = generateToken(registeredUser.insertId, username);
      res.setHeader('Content-Type', 'application/json');
      res.json({ token });
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error." });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    const token = generateToken(user);
    res.setHeader('Content-Type', 'application/json');
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

    return done(null, { id: user.id, username: user.username });
  } catch (err) {
    return done(err);
  }
};