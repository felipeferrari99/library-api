const express = require("express");
const router = express.Router();
const authors = require('../controllers/authors');
const jwtAuth = require('../middlewares/jwtAuth');
const isAdmin = require('../middlewares/isAdmin');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

router.post('/', jwtAuth, isAdmin, upload.single('image'), authors.createAuthor);
router.get('/', authors.getAuthors);
router.get('/:id', authors.showAuthor);
router.delete('/:id', jwtAuth, isAdmin, authors.deleteAuthor);
router.put('/:id', jwtAuth, isAdmin, upload.single('image'), authors.updateAuthor);

module.exports = router;