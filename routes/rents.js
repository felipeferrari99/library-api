const express = require("express");
const router = express.Router();
const rents = require('../controllers/rents');
const jwtAuth = require('../middlewares/jwtAuth');
const getIdFromToken = require('../middlewares/getIdFromToken');

router.get('/available', rents.getAvailableBooks);
router.post('/:id/rent', jwtAuth, getIdFromToken, rents.createRent);

module.exports = router;