const express = require("express");
const app = express();
const port = 8000;
const con = require('./database/db');

app.listen(port, () => {
    console.log("App listening on port", port);
});