const con = require('../database/db');
const bcrypt = require('bcrypt');

const saltRounds = 10;

con.connect(function (err) {
    const sql = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        type ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        UNIQUE (username),
        UNIQUE (email)
      )`;

    con.query(sql, (err, result) => {
      if (err) {
        console.error('Error creating users table:', err);
        return;
      }
      console.log('Users table created');
    });      
  }
);

async function userExists(username, email) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    con.query(query, [username, email], function (err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows.length > 0);
      }
    });
  });
}

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  userExists,
  hashPassword,
  comparePassword
};