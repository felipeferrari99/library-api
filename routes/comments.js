const express = require("express");
const router = express.Router({ mergeParams: true });
const comments = require('../controllers/comments');
const jwtAuth = require('../middlewares/jwtAuth');

router.post('/', jwtAuth, comments.createComment);
router.delete('/:commentId', jwtAuth, comments.deleteComment);

module.exports = router;