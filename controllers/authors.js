const con = require('../database/db');

module.exports.getAuthors = async (req, res) => {
    con.query('SELECT * FROM authors', (err, authors) => {
      res.send(authors)
    });
}

module.exports.showAuthor = async (req, res) => {
    const { id } = req.params;
    con.query('SELECT authors.*, books.title FROM authors INNER JOIN books ON authors.id = books.author WHERE authors.id = ?', [id], (err, author) => {
      res.send(author)
    });
}

module.exports.createAuthor = async (req, res) => {
    const { name } = req.body;
    await con.promise().query('INSERT INTO authors (name) VALUES (?)', name);
    res.json('Author created');
}

module.exports.deleteAuthor = async (req, res) => {
    const { id } = req.params;
    const [books] = await con.promise().query('SELECT id FROM books WHERE author = ?', [id]);
    const bookIds = books.flatMap((book) => book.id);
    await con.promise().query('DELETE FROM comments WHERE book_id IN (?)', [bookIds]);
    await con.promise().query('DELETE FROM books WHERE author = ?', [id]);
    await con.promise().query('DELETE FROM authors WHERE id = ?', [id]);
    res.json('Author deleted');
};