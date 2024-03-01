const con = require('../database/db');

module.exports.getAvailableBooks = async (req, res) => {
    con.query('SELECT books.*, authors.name FROM books INNER JOIN authors ON books.author = authors.id WHERE qty_available > 0', (err, books) => {
      res.send(books)
    });
}

module.exports.createRent = async (req, res) => {
    const bookId = req.params.id;
    const userId = req.userId;
    const [rows] = await con.promise().query('SELECT qty_available FROM books WHERE id = ?', [bookId]);
    const available = rows[0]?.qty_available;
    if (!available || available < 1) {
        return res.json('Book unavailable!');
    }
    const { daysRented } = req.body;
    await con.promise().query('INSERT INTO rents (date_rented, date_returned, book_id, user) VALUES (CURDATE(), CURDATE() + ?, ?, ?)', [daysRented, bookId, userId]);
    await con.promise().query('UPDATE books SET qty_available = qty_available - 1 WHERE id = ?', bookId);
    res.json('Book rented!');
}