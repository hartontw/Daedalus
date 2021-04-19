const commands = require('./commands/index');
const logger = require('./logger');

const Discord = require("discord.js");
const { cli } = require('winston/lib/winston/config');

const client = new Discord.Client();

function format(message) {
    return message.channel.type === 'dm' ? 
    `DM › ${message.author.username}: ${message.id}` 
    : `${message.guild.name} › ${message.channel.name} › ${message.author.username}: ${message.content.substring(0, 63).replace(/\r/g, '').replace(/\n/g, '')}`;
}

let started = false;
function start() 
{
    return new Promise( (resolve, reject) => {
        if (!started) {
            client.login(process.env.BOT_TOKEN);
    
            client.on('ready', () => {
                logger.info(`Bot is ready ${client.user.tag}`);
                client.user.setActivity('/help', { type: 'LISTENING' });
                resolve(client.channels.cache.map(c => c.id));
            });
        
            client.on('message', async message => {   
                logger.info(`${format(message)}`);
                const reply = await commands.user(message);
                if (reply && reply.hasErrors()) {
                    for (const error of reply.errors) {
                        logger.error(error.message, error);
                    }
                }
            });

            client.on('error', reject);
        
            started = true;
        }
        else reject(`Bot ${client.user.tag} is already started`);
    });
}

function getChannels() {
    return new Promise( resolve => {
        resolve(client.channels.cache.array());
    });
}

function getChannelById(id) {
    return new Promise( resolve => {
        resolve(client.channels.cache.get(id));
    });
}

function getGuilds() {
    return new Promise( resolve => {
        resolve(client.guilds.cache.array());
    });
}

function getGuildById(id) {
    return new Promise( resolve => {
        resolve(client.guilds.cache.get(id));
    });
}

function getChannelsGroupByGuild() {
    return new Promise( resolve => {
        resolve(
            client.guilds.cache.map(g => {
                return {
                    id: g.id,
                    name: g.name,
                    icon: g.iconURL(),
                    channels: g.channels.cache.filter(c => c.isText()).map(c => {
                        return {
                            id: c.id,
                            name: c.name
                        }
                    })
                }
            })
        );
    });
}

function sendToChannel(id, message) {
    return new Promise( (resolve, reject) => {
        client.channels.fetch(id)
        .then(channel => {
            channel.send(message)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
}

function getGuildChannels(id)
{
    return new Promise( (resolve, reject) => {
        client.guilds.fetch(id)
        .then(guild => {
            guild.channels.fetch()
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
}

module.exports = {
    start,
    getChannels,
    getChannelById,
    getGuilds,
    getGuildById,
    getGuildChannels,
    getChannelsGroupByGuild,
    sendToChannel,
    getTag: () => client.user.tag,
    getName: () => client.user.username
};