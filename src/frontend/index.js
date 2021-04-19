const botName = require('../bot').getName;
const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.use('/links', require('./routes/links'));
app.use('/apis', require('./routes/apis'));

app.get('/', (req, res) => {
    res.render('index', {bot: botName(), title:botName()});
});

module.exports = () => new Promise( resolve => {
        const port = process.env.PORT || 3000
        app.listen(port, () => {
            resolve(port)
        });
    });