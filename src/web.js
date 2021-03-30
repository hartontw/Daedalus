const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

module.exports = app;