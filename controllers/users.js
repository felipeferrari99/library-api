const con = require('../database/db');
const { userExists, hashPassword, comparePassword } = require('../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';
const passport = require("passport");
const { cloudinary } = require('../cloudinary');

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
    con.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function (err, result) {
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

module.exports.updateUser = async (req, res, next) => {
  const id = req.userId;
  if (id != req.params.id) return res.status(401).json({ message: 'Unauthorized.' });
  const [oldRows] = await con.promise().query('SELECT image FROM users WHERE id = ?', [id]);
  const oldImageUrl = oldRows[0].image;
  const oldPublicId = oldImageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
  const { username, password, image, description, favorite_book } = req.body;
  if (username !== req.user.username) {
    if (await userExists(username)) return res.status(400).json({ message: 'User already exists' });
  }
  const [rows] = await con.promise().query('SELECT id FROM books WHERE title = ?', [favorite_book]);
  const bookId = rows.length ? rows[0].id : null;
  if (password.length < 3) return res.status(400).json({ message: 'Password is too short.' });
  const hashedPassword = await hashPassword(password);
  await con.promise().query('UPDATE users SET username = ?, password = ?, image = ?, description = ?, favorite_book = ? WHERE id = ?', [username, hashedPassword, image, description, bookId, id]);
  const [newRows] = await con.promise().query('SELECT image FROM users WHERE id = ?', [id]);
  const imageUrl = newRows[0].image;
  const publicId = imageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
  if (publicId !== oldPublicId && oldPublicId !== 'library/Kw9sLx3vPq') {
    await cloudinary.uploader.destroy(oldPublicId);
  }
  passport.authenticate("local", (err, user) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.json({ token: generateToken(user) });
  })(req, res, next);
}

module.exports.loginStrategy = async (username, password, done) => {
  try {
    const [user] = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM users WHERE username=?', [username], function (err, rows) {
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