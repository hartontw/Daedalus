const bot = require('../../bot');
const data = require('../../database/index');
const logger = require('../../logger');
const zones = require('../../apis/timezones');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    data.getLinks()    
    .then(links => {
        res.render('links', {bot: bot.getName(), title:'Links', links});
    })
    .catch(error => {
        logger.error(error);
        res.send(error);
    });
});

router.get('/new', (req, res) => {
    zones()
    .then(zones => {
        res.render('link.new.ejs', {bot: bot.getName(), title:'New Link', zones});
    })
    .catch(error => {
        logger.error(error);
        res.render('link.new.ejs', {bot: bot.getName(), title:'New Link', zones:false});
    });
});

router.post('/new', (req, res) => {
    data.insertLink({
        name: req.body.name,
        destination: req.body.destination,
        pictureURL: req.body.pictureURL,
        cronjob: {
            rule: req.body.cronrule,
            timezone: req.body.timezone
        }
    })
    .then(link => {
        res.redirect(`/links/${link._id}`);
    })
    .catch(error => {
        logger.error(error);
        res.send(error);
    });
});

router.post('/edit/:id', (req, res) => {
    data.getLinkById(req.params.id)
    .then(link => {
        if (link) {
            link.destination = req.body.destination;
            link.name = req.body.name;
            link.pictureURL = req.body.pictureURL;
            link.cronjob = {
                rule: req.body.cronrule,
                timezone: req.body.timezone
            }
            data.updateLink(link)
            .then(() => {
                res.redirect(`/links/${link._id}`);
            })
            .catch(error => {
                logger.error(error);
                res.send(error);
            });
        }
        else res.redirect(`/links/${link._id}`);
    })
    .catch(error => {
        logger.error(error);
        res.send(error);
    })
});

router.post('/delete/:id', (req, res) => {
    data.deleteLink(req.params.id)
    .then(() => {
        res.redirect('/links');
    })
    .catch(error => {
        logger.error(error);
        res.send(error);
    });
});

router.get('/:id', async (req, res) => {
    try {
        const link = await data.getLinkById(req.params.id);        
        const guilds = await bot.getChannelsGroupByGuild();
        zones()
        .then(zones => {
            res.render('link.edit.ejs', {bot: bot.getName(), title:link.name || link.id, link, guilds, zones});
        })
        .catch(error => {
            logger.error(error);
            res.render('link.edit.ejs', {bot: bot.getName(), title:link.name || link.id, link, guilds, zones:false});
        });
    }
    catch(error) {
        logger.error(error);
        res.send(error);
    }
});

router.post('/:id/add', (req, res) => {
    data.addChannelToLink(req.params.id, req.body.channelID)
    .then(() => {
        res.redirect(`/links/${req.params.id}`)
    })
    .catch(error => {
        logger.error(error);
        res.send(error);
    });
});

router.post('/:id/remove', (req, res) => {
    data.deleteChannelFromLink(req.params.id, req.body.channelID)
    .then(() => {
        res.redirect(`/links/${req.params.id}`)
    })
    .catch(error => {
        logger.error(error);
        res.send(error);
    });
});

module.exports = router;