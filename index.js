const express = require("express");
const app = express();
const port = 8000;

app.use(express.urlencoded( {extended: true}));

const authorRoutes = require('./routes/authors');
const bookRoutes = require('./routes/books');

app.use('/author', authorRoutes);
app.use('/book', bookRoutes);

app.listen(port, () => {
    console.log("App listening on port", port);
});