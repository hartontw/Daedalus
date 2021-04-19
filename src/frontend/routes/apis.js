const botName = require('../../bot').getName;
const logger = require('../../logger');
const udemy = require('../../apis/udemy');
const alpha2 = require('../../apis/alpha2');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('apis', {bot: botName(), title:'APIS'});
});

router.get('/udemy', async (req, res) => {
    try {
        const categories = await udemy.getCourseCategories();
        const subCategories = await udemy.getCourseSubCategories();
        const languajes = await alpha2();
        res.render('udemy', {bot: botName(), title: 'Udemy', categories, subCategories, languajes});
    }
    catch(error) {
        logger.error(error);
        res.send(error);
    }
});

module.exports = router;