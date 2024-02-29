const express = require("express");
const router = express.Router();
const authors = require('../controllers/authors');

router.post('/', authors.createAuthor);
router.get('/', authors.getAuthors);
router.get('/:id', authors.showAuthor);
router.delete('/:id', authors.deleteAuthor);

module.exports = router;