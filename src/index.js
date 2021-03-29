require('dotenv').config();
const commands = require('./commands');
const logger = require('./logger');

const Discord = require("discord.js");

const client = new Discord.Client();

client.on('ready', () => {
    logger.info(`Bot is ready ${client.user.tag}`);
    client.user.setActivity('/help', { type: 'LISTENING' });
});

client.on('message', async message => {
    const reply = await commands.user(message);
    if (reply) {
        if (reply.hasErrors()) {
            logger.info(`User: ${message.author.username}, Message: ${reply.message.id}, Command: ${reply.command}, Errors:`);
            for (const error of reply.errors) {
                logger.error(error.message, error);
            }                
        } else logger.info(`User: ${message.author.username}, Message: ${reply.message.id}, Command: ${reply.command}`);
    } else {
        logger.info(`User: ${message.author.username}, Message: ${message.id}`);
    }
});

client.login(process.env.BOT_TOKEN);