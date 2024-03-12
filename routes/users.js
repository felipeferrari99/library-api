const express = require("express");
const router = express.Router();
const users = require('../controllers/users');
const jwtAuth = require('../middlewares/jwtAuth');
const getIdFromToken = require('../middlewares/getIdFromToken');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });

passport.use(new LocalStrategy(users.loginStrategy));

router.post('/register', users.register);
router.put('/user/:id', jwtAuth, getIdFromToken, upload.single('image'), users.updateUser);
router.post("/login", users.login);

module.exports = router;