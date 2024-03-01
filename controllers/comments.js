const con = require('../database/db');

module.exports.createComment = async (req, res) => {
    const userId = req.userId;
    const bookId = req.params.id;
    const { body } = req.body;
    await con.promise().query('INSERT INTO comments (body, book_id, user) VALUES (?, ?, ?)', [body, bookId, userId]);
    res.json('Comment created');
}

module.exports.deleteComment = async (req, res) => {
    const bookId = req.params.id;
    const { commentId } = req.params;
    await con.promise().query('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json('Comment deleted');
}