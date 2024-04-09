module.exports.CreateTables = (con) => {

    con.connect(function (err) {
    const sql = `
    CREATE TABLE IF NOT EXISTS authors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255) NOT NULL DEFAULT '${process.env.CLOUDINARY_PROFILE_URL}'
    )`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Authors table created");
    });
    });

    con.connect(function (err) {
    const sql = `
    CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        release_date DATE NOT NULL,
        image VARCHAR(255) NOT NULL DEFAULT '${process.env.CLOUDINARY_BOOK_URL}',
        qty_available INT NOT NULL,
        author INT NOT NULL,
        description TEXT,
        FOREIGN KEY (author) REFERENCES authors(id) ON DELETE CASCADE
    )`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Books table created");
    });
    });

    con.connect(function (err) {
    const sql = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        type ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        image VARCHAR(255) NOT NULL DEFAULT '${process.env.CLOUDINARY_PROFILE_URL}',
        description TEXT,
        favorite_book INT,
        UNIQUE (username),
        UNIQUE (email),
        FOREIGN KEY (favorite_book) REFERENCES books(id)
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

    con.connect(function (err) {
    const sql = `
    CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        body TEXT NOT NULL,
        rating INT NOT NULL,
        book_id INT NOT NULL,
        user INT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
    )`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Comments table created");
    });
    });

    con.connect(function (err) {
    const sql = `
    CREATE TABLE IF NOT EXISTS rents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date_rented DATE NOT NULL,
        date_for_return DATE NOT NULL,
        date_returned DATE,
        status VARCHAR(255) NOT NULL DEFAULT "active",
        book_id INT NOT NULL,
        user INT NOT NULL,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
    )`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Rents table created");
    });
    });
}