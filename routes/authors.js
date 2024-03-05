const express = require("express");
const router = express.Router();
const authors = require('../controllers/authors');
const jwtAuth = require('../middlewares/jwtAuth');
const isAdmin = require('../middlewares/isAdmin');

router.post('/', jwtAuth, isAdmin, authors.createAuthor);
router.get('/', authors.getAuthors);
router.get('/:id', authors.showAuthor);
router.delete('/:id', jwtAuth, isAdmin, authors.deleteAuthor);
router.put('/:id', jwtAuth, isAdmin, authors.updateAuthor);

module.exports = router;