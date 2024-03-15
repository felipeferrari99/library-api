const express = require("express");
const app = express();
const port = 8000;
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cors());

app.use(cookieParser());

app.use(express.urlencoded( {extended: true}));

const userRoutes = require('./routes/users');
const authorRoutes = require('./routes/authors');
const bookRoutes = require('./routes/books');
const commentRoutes = require('./routes/comments');
const rentRoutes = require('./routes/rents');

app.use('/', userRoutes, rentRoutes);
app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);
app.use('/books/:id/comments', commentRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
  });
  
  app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, something went wrong!';
    res.status(statusCode).json({ error: err.message });
  });

app.listen(port, () => {
    console.log("App listening on port", port);
});