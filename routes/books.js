const express = require("express");
const router = express.Router();
const books = require('../controllers/books');
const jwtAuth = require('../middlewares/jwtAuth');
const isAdmin = require('../middlewares/isAdmin');

router.get('/', books.getBooks);
router.post('/', jwtAuth, isAdmin, books.createBook);
router.delete('/:id', jwtAuth,isAdmin, books.deleteBook);
router.get('/:id', books.showBook);

module.exports = router;