const con = require('../database/db');

module.exports.getAuthors = async (req, res) => {
    con.query('SELECT * FROM authors', (err, authors) => {
      res.send(authors)
    });
}

module.exports.createAuthor = async (req, res) => {
    const { name } = req.body;
    await con.promise().query('INSERT INTO authors (name) VALUES (?)', name);
    res.send("DEU BOM")
}

module.exports.deleteAuthor = async (req, res) => {
    const { id } = req.params;
    await con.promise().query('DELETE FROM books WHERE author = ?', [id]);
    await con.promise().query('DELETE FROM authors WHERE id = ?', [id]);
    res.send("DEU BOM")
}