const con = require('../database/db');

module.exports.getBooks = async (req, res) => {
    con.query('SELECT books.*, authors.name FROM books INNER JOIN authors ON books.author = authors.id', (err, books) => {
      res.send(books)
    });
}

module.exports.createBook = async (req, res) => {
    const { title, release_date, image, author } = req.body;
    const [authorRows] = await con.promise().query('SELECT id FROM authors WHERE name = ?', [author]);
    if (authorRows.length === 0) {
        const [insertedAuthor] = await con.promise().query('INSERT INTO authors (name) VALUES (?)', [author]);
        authorId = insertedAuthor.insertId;
    } else {
        authorId = authorRows[0].id;
    }
    await con.promise().query('INSERT INTO books (title, release_date, image, author) VALUES (?, ?, ?, ?)', [title, release_date, image, authorId]);
    res.send("DEU BOM");
}

module.exports.deleteBook = async (req, res) => {
    const { id } = req.params;
    await con.promise().query('DELETE FROM books WHERE id = ?', [id]);
    res.send("DEU BOM")
}