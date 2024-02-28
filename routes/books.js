const express = require("express");
const router = express.Router();
const books = require('../controllers/books');

router.post('/', books.createBook);
router.get('/', books.getBooks);
router.delete('/:id', books.deleteBook);

module.exports = router;