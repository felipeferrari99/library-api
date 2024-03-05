const express = require("express");
const router = express.Router({ mergeParams: true });
const comments = require('../controllers/comments');
const jwtAuth = require('../middlewares/jwtAuth');
const getIdFromToken = require('../middlewares/getIdFromToken');
const isAuthor = require('../middlewares/isAuthor');

router.post('/', jwtAuth, getIdFromToken, comments.createComment);
router.delete('/:commentId', jwtAuth, isAuthor, comments.deleteComment);
router.put('/:commentId', jwtAuth, isAuthor, comments.updateComment);

module.exports = router;