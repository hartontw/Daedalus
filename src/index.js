require('dotenv').config();
const fs = require('fs');
const logger = require('./logger');
const bot = require('./bot');
const data = require('./database/index');
const web = require('./frontend/index');

if (!fs.existsSync('./data/')) fs.mkdirSync('data');

bot.start()
.then(data.start)
.then(db => {            
    logger.info(`${db} db is started`);
    web()
    .then(port => logger.info(`Listening on port ${port}`))
    .catch(logger.error);
})
.catch(logger.error);