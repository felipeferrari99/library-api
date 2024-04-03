require('dotenv').config();
const mysql = require('mysql2');
const createTables = require('./createTables')

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
  
con.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
    createTables.CreateTables(con)
  }
});

module.exports = con;