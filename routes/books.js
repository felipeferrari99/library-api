const express = require("express");
const router = express.Router();
const books = require('../controllers/books');
const jwtAuth = require('../middlewares/jwtAuth');

router.get('/', books.getBooks);
router.post('/', jwtAuth, books.createBook);
router.delete('/:id', jwtAuth, books.deleteBook);
router.get('/:id', books.showBook);

module.exports = router;