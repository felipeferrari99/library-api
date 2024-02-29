const con = require('../database/db');
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';

module.exports.createComment = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const bookId = req.params.id;
    const { body } = req.body;
    const decoded = jwt.verify(token, jwtSecret);  
    const id = decoded.userId;
    await con.promise().query('INSERT INTO comments (body, book_id, user) VALUES (?, ?, ?)', [body, bookId, id]);
    res.json('Comment created');
}

module.exports.deleteComment = async (req, res) => {
    const bookId = req.params.id;
    const { commentId } = req.params;
    await con.promise().query('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json('Comment deleted');
}