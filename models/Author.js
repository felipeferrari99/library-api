const con = require('../database/db')

con.connect(function (err) {
    const sql = `
    CREATE TABLE IF NOT EXISTS authors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(255) NOT NULL DEFAULT 'https://res.cloudinary.com/dsv8lpacy/image/upload/v1710962002/library/Kw9sLx3vPq.png'
    )`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Authors table created");
    });
});