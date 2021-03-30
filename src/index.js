require('dotenv').config();
const logger = require('./logger');
const bot = require('./bot');
const web = require('./web');
const data = require('./data');
const links = require('./links');

function updateLinks() {
    links(data, bot);
    data.updateDate();
}

bot.on('ready', () => {
    logger.info(`Bot is ready ${bot.user.tag}`);
    bot.user.setActivity('/help', { type: 'LISTENING' });

    updateLinks();
    setInterval(updateLinks, process.env.UPDATE_INTERVAL || 43200000);

    web.listen(process.env.PORT || 3000, () => {
        logger.info(`Listening on port ${process.env.PORT || 3000}`);
    });
});

web.get('/', (req, res) => {
    res.render('index', {
        guilds: bot.guilds.cache.map(g => {return {id:g.id, name:g.name, icon: g.iconURL(), description: g.description}})    
    });
});

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
        links: data.loadChannel(req.params.id) || [],
        updated: req.updated !== undefined
    });
}

web.get('/channels/:id', (req, res) => {
    renderChannel(req, res);
});

web.post('/channels/:id', (req, res, next) => {
    data.saveChannel(req.params.id, Object.values(req.body).filter(l => l !== ''));
    req.updated = true;
    next();
}, renderChannel);