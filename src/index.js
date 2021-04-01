require('dotenv').config();
const CronJob = require('cron').CronJob;
const logger = require('./logger');
const timezones = require('./timezones');
const bot = require('./bot');
const web = require('./web');
const data = require('./data');
const links = require('./links');
const youtube = require('./youtube');

let youtubeCronJob;
function updateYouTube() {
    if (youtubeCronJob) youtubeCronJob.stop();
    const cronjob = data.getYouTubeCronJob();
    youtubeCronJob = new CronJob(cronjob.rule, () => {
        logger.info('YouTube links update');
        youtube(data.getYouTubeLastUpdate(), data.getChannels(bot.channels.cache), (id, result) => bot.channels.cache.get(id).send(result));
        data.setYouTubeLastUpdate();
      }, null, true, cronjob.timeZone);
      youtubeCronJob.start();
}

function updateLinks() {
    logger.info('Links update');
    links(data.getLastUpdate(), data.getChannels(bot.channels.cache), (id, result) => bot.channels.cache.get(id).send(result));
    data.setLastUpdate();
}

bot.on('ready', () => {
    logger.info(`Bot is ready ${bot.user.tag}`);
    bot.user.setActivity('/help', { type: 'LISTENING' });

    data.start();

    updateYouTube();

    updateLinks();
    setInterval(updateLinks, process.env.UPDATE_INTERVAL || 43200000);

    web.listen(process.env.PORT || 3000, () => {
        logger.info(`Listening on port ${process.env.PORT || 3000}`);
    });
});

web.get('/', (req, res) => {
    res.render('index', {
        guilds: bot.guilds.cache.map(g => {
            return {
                id:g.id, 
                name:g.name, 
                icon: g.iconURL(), 
                description: g.description
            };
        })
    });
});

function renderYouTube(req, res) {    
    const {rule, timezone} = data.getYouTubeCronJob();
    const params = {
        updated: req.updated !== undefined,
        rule,
        timezone,
        zones: false
    }
    timezones()
    .then(zones => {
        params.zones = zones;
    })
    .catch(error => {
        logger.error(error);
    })
    .finally(() => {
        res.render('youtube', params);
    })
}

web.get('/youtube', (req, res) => {
    renderYouTube(req, res);
})

web.post('/youtube', (req, res, next) => {
    data.setYouTubeCronJob(req.body);
    updateYouTube();
    req.updated = true;
    next();
}, renderYouTube);

web.get('/guilds/:id', (req, res) => {
    const guild = bot.guilds.cache.get(req.params.id);
    res.render('guild', {
        name: guild.name,
        icon: guild.iconURL(),
        channels: guild.channels.cache.filter(c => c.type === 'text').sort((a, b) => a.rawPosition - b.rawPosition).map(c => {return {id:c.id, name:c.name}})
    });
});

function renderChannel(req, res) {
    const channel = bot.channels.cache.get(req.params.id);
    res.render('channel', {
        guildID: channel.guild.id,
        guildName: channel.guild.name,
        guildIcon: channel.guild.iconURL(),
        id: channel.id,
        name: channel.name,
        links: data.getChannelLinks(req.params.id) || [],
        updated: req.updated !== undefined
    });
}

web.get('/channels/:id', (req, res) => {
    renderChannel(req, res);
});

web.post('/channels/:id', (req, res, next) => {
    data.setChannelLinks(req.params.id, Object.values(req.body).filter(l => l !== ''));
    req.updated = true;
    next();
}, renderChannel);