const con = require('../database/db');
const { cloudinary } = require('../cloudinary');

module.exports.getBooks = async (req, res) => {
    con.query('SELECT books.*, authors.name as authorName FROM books INNER JOIN authors ON books.author = authors.id', (err, books) => {
      res.send(books)
    });
}

module.exports.createBook = async (req, res) => {
    let image = 'https://res.cloudinary.com/dsv8lpacy/image/upload/v1709664984/library/Pb4eTcn7tJ.jpg';
    if (req.file) {
        image = req.file.path;
    }
    const { title, release_date, author, qty_available } = req.body;
    const [authorRows] = await con.promise().query('SELECT id FROM authors WHERE name = ?', [author]);
    if (authorRows.length === 0) {
        const [insertedAuthor] = await con.promise().query('INSERT INTO authors (name) VALUES (?)', [author]);
        authorId = insertedAuthor.insertId;
    } else {
        authorId = authorRows[0].id;
    }
    await con.promise().query('INSERT INTO books (title, release_date, qty_available, image, author) VALUES (?, ?, ?, ?, ?)', [title, release_date, qty_available, image, authorId]);
    res.json('Book created');
}

module.exports.deleteBook = async (req, res) => {
    const { id } = req.params;
    const [rows] = await con.promise().query('SELECT image FROM books WHERE id = ?', [id]);
    const imageUrl = rows[0].image;
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
    if (publicId !== 'library/Pb4eTcn7tJ') {
        await cloudinary.uploader.destroy(publicId);
    }
    await con.promise().query('DELETE FROM rents WHERE book_id = ?', [id]);
    await con.promise().query('DELETE FROM comments WHERE book_id = ?', [id]);
    await con.promise().query('DELETE FROM books WHERE id = ?', [id]);
    res.json('Book deleted');
}

module.exports.updateBook = async (req, res) => {
    let image = 'https://res.cloudinary.com/dsv8lpacy/image/upload/v1709664984/library/Pb4eTcn7tJ.jpg';
    if (req.file) {
        image = req.file.path;
    }
    const { title, release_date, description, author, qty_available } = req.body;
    const { id } = req.params;
    const [oldRows] = await con.promise().query('SELECT image FROM books WHERE id = ?', [id]);
    const oldImageUrl = oldRows[0].image;
    const oldPublicId = oldImageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
    const [authorRows] = await con.promise().query('SELECT id FROM authors WHERE name = ?', [author]);
    if (authorRows.length === 0) {
        const [insertedAuthor] = await con.promise().query('INSERT INTO authors (name) VALUES (?)', [author]);
        authorId = insertedAuthor.insertId;
    } else {
        authorId = authorRows[0].id;
    }
    await con.promise().query('UPDATE books SET title = ?, release_date = ?, description = ?, image = ?, author = ?, qty_available = ? WHERE id = ?', [title, release_date, description, image, authorId, qty_available, id]);
    const [rows] = await con.promise().query('SELECT image FROM books WHERE id = ?', [id]);
    const imageUrl = rows[0].image;
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
    if (publicId !== oldPublicId && oldPublicId !== 'library/Pb4eTcn7tJ') {
        await cloudinary.uploader.destroy(oldPublicId);
    }
    res.json('Book updated');
}

module.exports.showBook = async (req, res) => {
    const { id } = req.params;
    con.query('SELECT books.*, authors.name as authorName FROM books INNER JOIN authors ON books.author = authors.id WHERE books.id = ?', [id], (err, results) => {
        const book = results[0];
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        con.query('SELECT comments.id, comments.body, users.username FROM comments INNER JOIN users ON comments.user = users.id WHERE comments.book_id = ?', id, (err, comments) => {
            const responseData = {
                book: book,
                comments: comments
            };
            res.json(responseData);
        });
    })
}