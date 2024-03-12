const con = require('../database/db');
const { cloudinary } = require('../cloudinary');

module.exports.getAuthors = async (req, res) => {
    con.query('SELECT * FROM authors', (err, authors) => {
      res.send(authors)
    });
}

module.exports.showAuthor = async (req, res) => {
  const { id } = req.params;
  con.query('SELECT * FROM authors WHERE authors.id = ?', [id], (err, author) => {
      if (!author) {
          return res.status(404).json({ message: 'Author not found' });
      }
      con.query('SELECT title FROM books WHERE author = ?', [id], (err, books) => {
          const responseData = {
              author: author,
              books: books
          };
          res.json(responseData);
      });
  });
};

module.exports.createAuthor = async (req, res) => {
    let image = 'https://res.cloudinary.com/dsv8lpacy/image/upload/v1709583405/library/Kw9sLx3vPq.png';
    if (req.file) {
        image = req.file.path;
    }
    const { name, description } = req.body;
    await con.promise().query('INSERT INTO authors (name, image, description) VALUES (?, ?, ?)', [name, image, description]);
    res.json('Author created');
}

module.exports.deleteAuthor = async (req, res) => {
    const { id } = req.params;
    const [books] = await con.promise().query('SELECT id FROM books WHERE author = ?', [id]);
    if (books && books.length > 0) {
        const bookIds = books.map((book) => book.id);
        await con.promise().query('DELETE FROM rents WHERE book_id IN (?)', [bookIds]);
        await con.promise().query('DELETE FROM comments WHERE book_id IN (?)', [bookIds]);
        const [rows] = await con.promise().query('SELECT image FROM books WHERE id IN (?)', [bookIds]);
        const imageUrl = rows[0].image;
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
        if (publicId !== 'library/Pb4eTcn7tJ') {
            await cloudinary.uploader.destroy(publicId);
        }
        await con.promise().query('DELETE FROM books WHERE author = ?', [id]);
    }
    const [authorRows] = await con.promise().query('SELECT image FROM authors WHERE id = ?', [id]);
    const authorImageUrl = authorRows[0].image;
    const authorPublicId = authorImageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
    if (authorPublicId !== 'library/Kw9sLx3vPq') {
        await cloudinary.uploader.destroy(authorPublicId);
    }
    await con.promise().query('DELETE FROM authors WHERE id = ?', [id]);
    res.json('Author deleted');
};

module.exports.updateAuthor = async (req, res) => {
    let image = 'https://res.cloudinary.com/dsv8lpacy/image/upload/v1709583405/library/Kw9sLx3vPq.png';
    if (req.file) {
        image = req.file.path;
    }
    const { name, description } = req.body;
    const { id } = req.params;
    const [oldRows] = await con.promise().query('SELECT image FROM authors WHERE id = ?', [id]);
    const oldImageUrl = oldRows[0].image;
    const oldPublicId = oldImageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
    await con.promise().query('UPDATE authors SET name = ?, image = ?, description = ? WHERE id = ?', [name, image, description, id]);
    const [rows] = await con.promise().query('SELECT image FROM authors WHERE id = ?', [id]);
    const imageUrl = rows[0].image;
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.').slice(0, -1).join('.');
    if (publicId !== oldPublicId && oldPublicId !== 'library/Kw9sLx3vPq') {
        await cloudinary.uploader.destroy(oldPublicId);
    }
    res.json('Author updated');
}