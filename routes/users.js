const express = require("express");
const router = express.Router();
const users = require('../controllers/users');
const jwtAuth = require('../middlewares/jwtAuth');
const getIdFromToken = require('../middlewares/getIdFromToken');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy(users.loginStrategy));

router.post('/register', users.register);
router.put('/user/:id', jwtAuth, getIdFromToken, users.updateUser);
router.post("/login", users.login);
router.get('/logout', users.logout);

module.exports = router;