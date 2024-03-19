const con = require('../database/db');
const { userExists, hashPassword, comparePassword } = require('../models/user');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.SECRET;
const passport = require("passport");
const bcrypt = require("bcrypt");
const { cloudinary } = require('../cloudinary');
require('dotenv').config();

const generateToken = (user) => {
  const payload = { userId: user.id, username: user.username, type: user.type, image: user.image };
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
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    con.query(query, [username, email, hashedPassword], function (err, result) {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      con.promise().query('SELECT image FROM users WHERE id = ?', [result.insertId])
        .then(([rows, fields]) => {
          const image = rows[0].image;
          const payload = { id: result.insertId, username, type: 'user', image };
          const token = generateToken(payload);
          res.json({ token });
        })
        .catch(err => {
          console.error('Error fetching user image:', err);
          return res.status(500).json({ message: 'Internal server error' });
        });
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
    con.promise().query('SELECT image FROM users WHERE id = ?', [user.id])
    .then(([rows, fields]) => {
      const image = rows[0].image;
      const payload = { id: user.id, username: user.username, type: user.type, image };
      const token = generateToken(payload);
      res.json({ token });
    })
    .catch(err => {
      console.error('Error fetching user image:', err);
      return res.status(500).json({ message: 'Internal server error' });
    });
  })(req, res, next);
};

module.exports.updateUser = async (req, res, next) => {
  const id = req.userId;
  if (id != req.params.id) return res.status(401).json({ message: "Unauthorized." });
  const { email, password, description } = req.body;
  const [oldRows] = await con.promise().query("SELECT email, password FROM users WHERE id = ?", [id]);
  const oldPassword = oldRows[0].password;
  const oldEmail = oldRows[0].email;
  if (email !== oldEmail) {
    if (await userExists(null, email)) return res.status(400).json({ message: "User already exists" });
  }
  if (password && password.length < 3) return res.status(400).json({ message: "Password is too short." });
  let hashedPassword = oldPassword;
  if (password && password !== oldPassword) {
    const isPasswordMatch = await new Promise((resolve, reject) => {
      bcrypt.compare(password, oldPassword, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
    if (!isPasswordMatch) {
      hashedPassword = await hashPassword(password);
    }
  }
  await con.promise().query("UPDATE users SET email = ?, password = ?, description = ? WHERE id = ?", [email, hashedPassword, description, id]);
  res.json('User updated');
  (req, res, next);
};

module.exports.changeImage = async (req, res, next) => {
  let image = 'https://res.cloudinary.com/dsv8lpacy/image/upload/v1709583405/library/Kw9sLx3vPq.png';
  if (req.file) {
      image = req.file.path;
  }
  const { id } = req.params;
  const [oldRows] = await con.promise().query('SELECT image FROM users WHERE id = ?', [id]);
  const oldImageUrl = oldRows[0].image;
  const oldPublicId = oldImageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
  await con.promise().query('UPDATE users SET image = ? WHERE id = ?', [image, id]);
  const [rows] = await con.promise().query('SELECT image FROM users WHERE id = ?', [id]);
  const imageUrl = rows[0].image;
  const publicId = imageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
  if (publicId !== oldPublicId && oldPublicId !== 'library/Kw9sLx3vPq') {
      await cloudinary.uploader.destroy(oldPublicId);
  }
  passport.authenticate("local", (err, user) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    con.promise().query('SELECT username, type, image FROM users WHERE id = ?', [id])
        .then(([rows, fields]) => {
          const image = rows[0].image;
          const username = rows[0].username;
          const type = rows[0].type;
          const payload = { id: id, username, type, image };
          const token = generateToken(payload);
          res.json({ token });
        })
  })(req, res, next);
};

module.exports.showUser = async (req, res) => {
  const { id } = req.params;
  con.query('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      con.query('SELECT users.favorite_book, books.title, books.image, books.author, authors.name as authorName FROM users INNER JOIN books ON books.id = users.favorite_book INNER JOIN authors ON books.author = authors.id WHERE users.id = ?;', [id], (err, favorite_book) => {
          const responseData = {
              user: user,
              book: favorite_book
          };
          res.json(responseData);
      });
  });
};

module.exports.favorite = async (req, res, next) => {
  const id = req.userId;
  const bookId = req.params.id;
  const [rows] = await con.promise().query('SELECT favorite_book FROM users WHERE id = ?', [id]);
  const favorite_book = rows[0].favorite_book;
  if (favorite_book == bookId) {
    await con.promise().query("UPDATE users SET favorite_book = NULL WHERE id = ?", [id]);
  } else {
    await con.promise().query("UPDATE users SET favorite_book = ? WHERE id = ?", [bookId, id]);
  }
  res.json('User updated');
  (req, res, next);
};

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